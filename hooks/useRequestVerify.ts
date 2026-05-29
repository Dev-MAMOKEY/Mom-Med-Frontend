import { useMutation } from '@tanstack/react-query';
import { apiCall } from '@/api';
import { RequestVerifyResSchema } from '@/api/types/parent';
import { mockRequestVerify } from '@/mocks/parents';

export function useRequestVerify() {
  return useMutation({
    // 백엔드에 폰 인증 엔드포인트 없음 — mock 고정
    mutationFn: (phone: string) =>
      apiCall(
        'POST',
        '/v1/me/parents/request-verify',
        { phone },
        RequestVerifyResSchema,
        mockRequestVerify,
        'always-mock',
      ),
  });
}
