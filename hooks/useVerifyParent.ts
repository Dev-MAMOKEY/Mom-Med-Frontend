import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/api';
import { VerifyResSchema, type VerifyReq } from '@/api/types/parent';
import { mockVerify } from '@/mocks/parents';

export function useVerifyParent() {
  const queryClient = useQueryClient();
  return useMutation({
    // 백엔드에 폰 인증 엔드포인트 없음 — mock 고정
    mutationFn: (req: VerifyReq) =>
      apiCall(
        'POST',
        '/v1/me/parents/verify',
        req,
        VerifyResSchema,
        () => mockVerify(req),
        'always-mock',
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] }),
  });
}
