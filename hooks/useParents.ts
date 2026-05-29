import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api';
import { ParentListSchema } from '@/api/types/parent';
import { mockParents } from '@/mocks/parents';

export function useParents() {
  return useQuery({
    queryKey: ['parents', 'me'],
    // 백엔드에 /me 개념 없음 — mock 고정 (PRD: F1 본 슬라이스는 mock으로 충분)
    queryFn: () =>
      apiCall('GET', '/v1/me/parents', undefined, ParentListSchema, mockParents, 'always-mock'),
  });
}
