import { ZodSchema } from 'zod';

import { ApiError, SafetyBlockError } from './types/common';

// 에러 클래스는 ./types/common 단일 소스 — 중복 정의 시 instanceof 불일치 위험
export { ApiError, SafetyBlockError };

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function apiCall<T>(
  method: HttpMethod,
  path: string,
  body: unknown | undefined,
  schema: ZodSchema<T>,
  mockFn?: () => Promise<T>,
): Promise<T> {
  if (USE_MOCK && mockFn) {
    await new Promise((r) => setTimeout(r, 200));
    return mockFn();
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 409) {
    throw new SafetyBlockError(await res.json());
  }
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  const json = await res.json();
  return schema.parse(json);
}
