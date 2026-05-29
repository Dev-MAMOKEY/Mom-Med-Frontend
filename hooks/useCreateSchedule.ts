import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mockCreateSchedule } from '@/mocks/schedule';
import type { CreateScheduleReq, MedicationSchedule } from '@/api/types/schedule';

// 약 상세 화면의 "일정 추가" 흐름.
// onSuccess 시 schedule + today intakes 캐시 무효화 → 알림 화면 자동 갱신.
// itemName은 mock 전용 보조 정보 — 알림 카드 표시 이름. 실 BE는 medication FK로 직접 조회.
export function useCreateSchedule(
  medicationId: string,
  parentId: string,
  itemName?: string,
) {
  const qc = useQueryClient();
  return useMutation<MedicationSchedule, Error, CreateScheduleReq>({
    mutationFn: async (req) =>
      mockCreateSchedule(medicationId, parentId, req, itemName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', medicationId] });
      qc.invalidateQueries({ queryKey: ['today-intakes', parentId] });
    },
  });
}
