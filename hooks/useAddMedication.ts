import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiCall } from '@/api';
import {
  BeAddMedicationResSchema,
  beAddMedicationToFe,
  feAddMedReqToBe,
} from '@/api/adapters';
import { type AddMedicationReq } from '@/api/types';
import { mockAddMedication } from '@/mocks/medications';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 약 추가 mutation — BLOCK은 SafetyBlockError로 throw됨 (호출자가 instanceof 분기)
// onSuccess에서 약장 + warnings 쿼리 무효화 → 약장 화면 자동 갱신
//
// USE_MOCK=false (실서버 모드) 일 때 어댑터 적용:
//   요청: FE { item_seq, source, dosage? } → BE { itemSeq, drugName, startedOn, memo }
//   응답: BE { id, itemSeq, drugName, safety_check } → FE { medication_id, item_seq, safety_check }
//   409 BLOCK 응답은 client.ts 의 apiCall이 자동으로 FE 형태로 변환해 throw
export function useAddMedication(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: AddMedicationReq) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockAddMedication(parentId, req);
      }
      const beRes = await apiCall(
        'POST',
        `/v1/parents/${parentId}/medications`,
        feAddMedReqToBe(req),
        BeAddMedicationResSchema,
        undefined,
        'always-real',
      );
      return beAddMedicationToFe(beRes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications', parentId] });
      qc.invalidateQueries({ queryKey: ['medications-with-warnings', parentId] });
    },
  });
}
