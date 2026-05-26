import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { AllergySchema, type AddAllergyReq } from '@/api/types';
import { mockAddAllergy } from '@/mocks/allergies';

// 알레르기 추가 mutation — ★ invalidate 2종:
//   1) ['allergies', ...]      — 본인 목록 갱신
//   2) ['emergency-card', ...] — F4 응급카드 P1(알레르기 영역) 갱신
// medications-with-warnings는 알레르기엔 영향 없으므로 제외(질병과 다른 점).
export function useAddAllergy(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddAllergyReq) =>
      apiCall(
        'POST',
        `/v1/parents/${parentId}/allergies`,
        req,
        AllergySchema,
        () => mockAddAllergy(parentId, req),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allergies', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
