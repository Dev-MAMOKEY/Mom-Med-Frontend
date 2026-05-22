import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api';
import { ParentListSchema } from '@/api/types/parent';
import { mockParents } from '@/mocks/parents';

export function useParents() {
  return useQuery({
    queryKey: ['parents', 'me'],
    queryFn: () => apiCall('GET', '/v1/me/parents', undefined, ParentListSchema, mockParents),
  });
}
