import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { DrugDetailSchema } from '@/api/types';
import { mockDrugDetail } from '@/mocks/medications';

// 약 상세 — 식약처 마스터(외형·주의사항). itemSeq 없으면 비활성
export function useDrugDetail(itemSeq: string) {
  return useQuery({
    queryKey: ['drug', itemSeq],
    enabled: !!itemSeq,
    queryFn: () =>
      apiCall(
        'GET',
        `/v1/drugs/${itemSeq}`,
        undefined,
        DrugDetailSchema,
        () => mockDrugDetail(itemSeq),
      ),
  });
}
