import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { mockDeleteMedication } from '@/mocks/medications';
import { mockDeleteSchedule } from '@/mocks/schedule';

const DeleteResultSchema = z.unknown().optional();
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 약 삭제 액션 — BE 호출 + FE schedule mock 정리.
//
// 슬라이스 1 한계: BE에 medication_schedules 테이블이 아직 없으므로 약 삭제 시 BE 측에서
// schedule cascade가 일어나지 않는다. FE의 schedule mock(인메모리 Map)도 직접 정리해야
// 알림 화면의 useTodayIntakes가 다시 조회될 때 정상적으로 빈 결과를 받는다.
// BE schedule API가 구현되면 BE의 ON DELETE CASCADE가 처리하므로 이 라인을 제거 가능.
//
// hook에서 분리한 이유: react-query useMutation 환경 없이 단위 테스트 가능.
export async function performDeleteMedication(
  parentId: string,
  medicationId: string,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    await mockDeleteMedication(parentId, medicationId);
    // mockDeleteMedication 내부에서 mockDeleteSchedule cascade 처리됨.
    return;
  }
  await apiCall(
    'DELETE',
    `/v1/parents/${parentId}/medications/${medicationId}`,
    undefined,
    DeleteResultSchema,
    undefined,
    'always-real',
  );
  // 슬라이스 1 한계: BE에 schedule 미구현 → FE mock에서 직접 cascade.
  await mockDeleteSchedule(medicationId);
}

// 약 삭제 mutation — BE는 204 No Content 반환. FE는 mutate 결과 본문을 사용하지 않으므로 {success:true}로 고정.
export function useDeleteMedication(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (medicationId: string): Promise<{ success: true }> => {
      await performDeleteMedication(parentId, medicationId);
      return { success: true };
    },
    onSuccess: (_data, medicationId) => {
      qc.invalidateQueries({ queryKey: ['medications', parentId] });
      qc.invalidateQueries({ queryKey: ['medications-with-warnings', parentId] });
      // 약 삭제는 BE CASCADE로 그 약의 schedule + intake_logs도 함께 사라짐.
      // FE 캐시도 정리해 약장·약 상세·알림 화면 모두 즉시 동기화.
      qc.invalidateQueries({ queryKey: ['schedule', medicationId] });
      qc.invalidateQueries({ queryKey: ['today-intakes', parentId] });
    },
  });
}
