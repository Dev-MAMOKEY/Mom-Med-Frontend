import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { DiseaseSearchResListSchema } from '@/api/types';
import { mockDiseaseSearch } from '@/mocks/disease-search';

// KCD 질병 검색 — HIRA 12904 API. 2글자 이상 입력 시만 활성 (useDrugSearch와 동일 정책)
export function useDiseaseSearch(query: string) {
  return useQuery({
    queryKey: ['disease-search', query],
    enabled: query.length >= 2,
    // 백엔드에 KCD 검색 엔드포인트 없음 — mock 고정
    queryFn: () =>
      apiCall(
        'GET',
        `/v1/diseases/search?q=${encodeURIComponent(query)}`,
        undefined,
        DiseaseSearchResListSchema,
        () => mockDiseaseSearch(query),
        'always-mock',
      ),
  });
}
