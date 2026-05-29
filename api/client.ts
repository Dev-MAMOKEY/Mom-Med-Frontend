import { ZodSchema } from 'zod';

import { beBlockErrorToFe } from './adapters';
import { ApiError, SafetyBlockError } from './types/common';

// 에러 클래스는 ./types/common 단일 소스 — 중복 정의 시 instanceof 불일치 위험
export { ApiError, SafetyBlockError };

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

// 'auto'        — EXPO_PUBLIC_USE_MOCK 환경변수 따름 (기본)
// 'always-mock' — env 무시하고 mock 사용 (백엔드에 엔드포인트가 없는 경우)
// 'always-real' — env 무시하고 실 백엔드 호출
export type MockMode = 'auto' | 'always-mock' | 'always-real';

export async function apiCall<T>(
  method: HttpMethod,
  path: string,
  body: unknown | undefined,
  schema: ZodSchema<T>,
  mockFn?: () => Promise<T>,
  mockMode: MockMode = 'auto',
): Promise<T> {
  const shouldUseMock =
    mockMode === 'always-mock' ? true : mockMode === 'always-real' ? false : USE_MOCK;

  if (shouldUseMock && mockFn) {
    await new Promise((r) => setTimeout(r, 200));
    return mockFn();
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 409) {
    // BE의 BlockErrorResponse를 FE 형태로 변환해 throw — safety-result 모달이 그대로 소비
    const rawBody = await res.json().catch(() => null);
    throw new SafetyBlockError(beBlockErrorToFe(rawBody));
  }
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  // 204 No Content (DELETE) — 본문 없으므로 빈 객체로 처리. 호출자가 schema.parse 통과시키도록 .optional() 등 사용 권장.
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return schema.parse(undefined);
  }

  const json = await res.json();

  // 백엔드는 모든 2xx 응답을 RsData<T> ({ success, code, message, data })로 감싸서 반환.
  // FE 스키마는 unwrap된 data 부분만 알고 있으므로 여기서 자동으로 풀어줌.
  const payload =
    typeof json === 'object' &&
    json !== null &&
    'success' in json &&
    'data' in json
      ? (json as { data: unknown }).data
      : json;

  return schema.parse(payload);
}
