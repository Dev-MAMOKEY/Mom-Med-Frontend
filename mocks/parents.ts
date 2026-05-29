import { ApiError } from '@/api/client';
import type { Parent, RequestVerifyRes, VerifyRes } from '@/api/types/parent';

export const mockParents = async (): Promise<{ parents: Parent[] }> => ({
  parents: [
    {
      // 실제 백엔드 DB에 POST /v1/parents로 생성된 어머니 — UUID는 실서버와 일치 (BE에 /me/parents가 없어서 mock 유지하되 ID만 실 UUID로 교체)
      parent_id: '530a7d32-7451-4c20-a32b-599b05eefa5a',
      display_name: '어머니',
      birthdate: '1954-03-15',
      age: 72,
      address_sido: '대구광역시',
      address_sigungu: '중구',
      medication_count: 0,
      alert_count: 0,
      conditions: [],
    },
    {
      // BE에 POST /v1/parents로 생성된 아버지 — UUID는 실서버와 일치 (어머니와 동일 패턴)
      parent_id: '50a5fcc1-8ae1-48d5-a5a9-601d321d186e',
      display_name: '아버지',
      birthdate: '1951-08-22',
      age: 74,
      address_sido: '대구광역시',
      address_sigungu: '중구',
      medication_count: 0,
      alert_count: 0,
      conditions: [],
    },
  ],
});

export const mockRequestVerify = async (): Promise<RequestVerifyRes> => ({
  request_id: 'mock-req-001',
  expires_in: 180,
});

export const mockVerify = async (req: { code: string }): Promise<VerifyRes> => {
  if (req.code === '0000') {
    return {
      success: true,
      parent_id: 'new-mock-parent',
      display_name: '시어머니',
    };
  }
  throw new ApiError(400, { error: 'invalid_code' });
};
