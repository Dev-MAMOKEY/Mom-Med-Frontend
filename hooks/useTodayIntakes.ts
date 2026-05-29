import { useQuery } from '@tanstack/react-query';

import { mockGetTodayIntakes } from '@/mocks/schedule';
import { mockMedications } from '@/mocks/medications';
import type { IntakeListResponse } from '@/api/types/schedule';

// 오늘(또는 임의 날짜)의 부모 복용 리스트.
// mock 단계에선 schedule mock의 item_name이 비어있어서 mockMedications와 join해 보정.
// 실 BE 도착 시 BE 응답이 item_name 포함하므로 join 로직 제거.
export function useTodayIntakes(parentId: string, date: string) {
  return useQuery<IntakeListResponse>({
    queryKey: ['today-intakes', parentId, date],
    enabled: !!parentId && !!date,
    queryFn: async () => {
      const res = await mockGetTodayIntakes(parentId, date);
      const meds = await mockMedications(parentId);
      const nameByMedId = new Map<string, string>();
      const nameByItemSeq = new Map<string, string>();
      for (const m of meds.medications) {
        if (m.medication_id) nameByMedId.set(m.medication_id, m.item_name);
        nameByItemSeq.set(m.item_seq, m.item_name);
      }
      return {
        date: res.date,
        intakes: res.intakes.map((i) => ({
          ...i,
          item_name:
            nameByMedId.get(i.medication_id) ??
            nameByItemSeq.get(i.medication_id) ??
            i.item_name,
        })),
      };
    },
  });
}
