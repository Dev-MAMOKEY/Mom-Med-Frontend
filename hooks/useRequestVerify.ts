import { useMutation } from '@tanstack/react-query';
import { apiCall } from '@/api';
import { RequestVerifyResSchema } from '@/api/types/parent';
import { mockRequestVerify } from '@/mocks/parents';

export function useRequestVerify() {
  return useMutation({
    mutationFn: (phone: string) =>
      apiCall(
        'POST',
        '/v1/me/parents/request-verify',
        { phone },
        RequestVerifyResSchema,
        mockRequestVerify,
      ),
  });
}
