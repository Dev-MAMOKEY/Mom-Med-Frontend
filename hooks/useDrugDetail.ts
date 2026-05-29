import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { DrugDetailSchema } from '@/api/types';
import { mockDrugDetail } from '@/mocks/medications';

// 약 상세 — 식약처 마스터(외형·주의사항). itemSeq 없으면 비활성
export function useDrugDetail(itemSeq: string) {
  return useQuery({
    queryKey: ['drug', itemSeq],
    enabled: !!itemSeq,
    // 백엔드 직접 GET /v1/drugs/{itemSeq} 없음 (identify+contraindications로 분리됨) — mock 고정
    queryFn: () =>
      apiCall(
        'GET',
        `/v1/drugs/${itemSeq}`,
        undefined,
        DrugDetailSchema,
        () => mockDrugDetail(itemSeq),
        'always-mock',
      ),
  });
}
