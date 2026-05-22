import { ApiError } from '@/api/client';
import type { Parent, RequestVerifyRes, VerifyRes } from '@/api/types/parent';

export const mockParents = async (): Promise<{ parents: Parent[] }> => ({
  parents: [
    {
      parent_id: 'mom-001',
      display_name: '어머니',
      birthdate: '1954-03-15',
      age: 72,
      address_sido: '대구광역시',
      address_sigungu: '중구',
      medication_count: 8,
      alert_count: 1,
      conditions: ['I10', 'E11'],
    },
    {
      parent_id: 'dad-001',
      display_name: '아버지',
      birthdate: '1951-08-22',
      age: 75,
      address_sido: '대구광역시',
      address_sigungu: '중구',
      medication_count: 5,
      alert_count: 0,
      conditions: ['M19'],
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
