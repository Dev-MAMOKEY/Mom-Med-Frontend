import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mockCheckIntake } from '@/mocks/schedule';
import type { CheckIntakeReq, IntakeLog } from '@/api/types/schedule';

// 한 회의 복용 체크/스킵. 후입력 지원(taken_at 생략 시 BE가 now()).
export function useCheckIntake(parentId: string) {
  const qc = useQueryClient();
  return useMutation<IntakeLog, Error, { intakeId: string; req: CheckIntakeReq }>({
    mutationFn: async ({ intakeId, req }) => mockCheckIntake(intakeId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today-intakes', parentId] });
    },
  });
}
