import { useQuery } from '@tanstack/react-query';

import { mockGetSchedule } from '@/mocks/schedule';
import type { MedicationSchedule } from '@/api/types/schedule';

// 약 1개당 일정 0~1개. 없으면 null.
// BE 도착 전엔 mock 고정. 실 BE 도착 시 useParents/useDrugSearch처럼 USE_MOCK 분기 추가.
export function useSchedule(medicationId: string) {
  return useQuery<MedicationSchedule | null>({
    queryKey: ['schedule', medicationId],
    enabled: !!medicationId,
    queryFn: async () => mockGetSchedule(medicationId),
  });
}
