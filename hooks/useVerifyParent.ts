import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/api';
import { VerifyResSchema, type VerifyReq } from '@/api/types/parent';
import { mockVerify } from '@/mocks/parents';

export function useVerifyParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: VerifyReq) =>
      apiCall('POST', '/v1/me/parents/verify', req, VerifyResSchema, () => mockVerify(req)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] }),
  });
}
