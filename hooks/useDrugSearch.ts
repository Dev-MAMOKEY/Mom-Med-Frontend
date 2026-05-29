import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { MedicationSchema } from '@/api/types';
import { mockDrugSearch } from '@/mocks/medications';

const DrugSearchResSchema = z.object({
  results: z.array(MedicationSchema),
});

// 약 이름·성분 검색 — 2글자 이상 입력 시 활성
export function useDrugSearch(query: string) {
  return useQuery({
    queryKey: ['drug-search', query],
    enabled: query.length >= 2,
    // 백엔드에 약 검색 엔드포인트 없음 — mock 고정
    queryFn: () =>
      apiCall(
        'GET',
        `/v1/drugs/search?q=${encodeURIComponent(query)}`,
        undefined,
        DrugSearchResSchema,
        () => mockDrugSearch(query),
        'always-mock',
      ),
  });
}
