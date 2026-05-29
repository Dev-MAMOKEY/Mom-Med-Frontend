import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mockDeleteSchedule } from '@/mocks/schedule';

export function useDeleteSchedule(medicationId: string, parentId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => mockDeleteSchedule(medicationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', medicationId] });
      qc.invalidateQueries({ queryKey: ['today-intakes', parentId] });
    },
  });
}
