import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mockUpdateSchedule } from '@/mocks/schedule';
import type {
  MedicationSchedule,
  UpdateScheduleReq,
} from '@/api/types/schedule';

export function useUpdateSchedule(medicationId: string, parentId: string) {
  const qc = useQueryClient();
  return useMutation<MedicationSchedule, Error, UpdateScheduleReq>({
    mutationFn: async (req) => mockUpdateSchedule(medicationId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', medicationId] });
      qc.invalidateQueries({ queryKey: ['today-intakes', parentId] });
    },
  });
}
