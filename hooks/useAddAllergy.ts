import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { BeAllergySchema, beAllergyToFe, feAddAllergyReqToBe } from '@/api/adapters';
import { type AddAllergyReq } from '@/api/types';
import { mockAddAllergy } from '@/mocks/allergies';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 알레르기 추가 mutation — ★ invalidate 2종:
//   1) ['allergies', ...]      — 본인 목록 갱신
//   2) ['emergency-card', ...] — F4 응급카드 P1(알레르기 영역) 갱신
export function useAddAllergy(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: AddAllergyReq) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockAddAllergy(parentId, req);
      }
      const beRes = await apiCall(
        'POST',
        `/v1/parents/${parentId}/allergies`,
        feAddAllergyReqToBe(req),
        BeAllergySchema,
        undefined,
        'always-real',
      );
      return beAllergyToFe(beRes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allergies', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
