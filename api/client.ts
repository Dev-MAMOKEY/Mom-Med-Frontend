import { ZodSchema } from 'zod';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`ApiError ${status}`);
    this.name = 'ApiError';
  }
}

export class SafetyBlockError extends ApiError {
  constructor(body: unknown) {
    super(409, body);
    this.name = 'SafetyBlockError';
  }
}

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
