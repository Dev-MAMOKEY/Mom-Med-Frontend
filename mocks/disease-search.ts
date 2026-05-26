import type { DiseaseSearchResult } from '@/api/types';

// ============================================================================
// KCD 검색 — HIRA 12904 9개 카탈로그를 sickCd/sickNm/sickEngNm 모두에서 부분 일치
// ============================================================================

const ALL_DISEASES: DiseaseSearchResult[] = [
  { sickCd: 'I10', sickNm: '본태성 (원발성) 고혈압', sickEngNm: 'Essential (primary) hypertension' },
  { sickCd: 'E11', sickNm: '2형 당뇨병', sickEngNm: 'Type 2 diabetes mellitus' },
  { sickCd: 'K25', sickNm: '위궤양', sickEngNm: 'Gastric ulcer' },
  { sickCd: 'J45', sickNm: '천식', sickEngNm: 'Asthma' },
  { sickCd: 'M19', sickNm: '기타 골관절염', sickEngNm: 'Other osteoarthritis' },
  { sickCd: 'I20', sickNm: '협심증', sickEngNm: 'Angina pectoris' },
  { sickCd: 'I63', sickNm: '뇌경색증', sickEngNm: 'Cerebral infarction' },
  { sickCd: 'N18', sickNm: '만성 신장병', sickEngNm: 'Chronic kidney disease' },
  { sickCd: 'J44', sickNm: '기타 만성 폐쇄성 폐질환', sickEngNm: 'COPD' },
];

export const mockDiseaseSearch = async (
  q: string,
): Promise<{ results: DiseaseSearchResult[] }> => {
  const lower = q.toLowerCase();
  return {
    results: ALL_DISEASES.filter(
      (d) =>
        d.sickCd.toLowerCase().includes(lower) ||
        d.sickNm.includes(q) ||
        d.sickEngNm.toLowerCase().includes(lower),
    ),
  };
};
