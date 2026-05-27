import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { ConditionDrugWarning } from '@/api/types';
import type { Medication } from '@/api/types/medication';
import { isAnticoagulant } from '@/api/types/safety';
import { EmptyState } from '@/components/primitives';
import { MedicationListItem } from './MedicationListItem';
import type { MedicationListItemVariant } from './MedicationListItem';

export interface MedicationListProps {
  medications: Medication[];
  warnings?: ConditionDrugWarning[];
  variant?: MedicationListItemVariant;
  emptyState?: ReactNode;
  onItemPress?: (med: Medication) => void;
}

// 항응고제 우선 정렬 + 추가일 최신순 (안정 정렬을 위해 단일 비교 함수 사용)
function sortAnticoagulantFirst(a: Medication, b: Medication): number {
  const aw = isAnticoagulant(a);
  const bw = isAnticoagulant(b);
  if (aw !== bw) return aw ? -1 : 1;
  return 0;
}

// 약 카드 컬렉션 — 항응고제 최상단·variant 전달·빈 상태 처리 (F4 응급카드·F6 부모홈에서 재사용)
export function MedicationList({
  medications,
  warnings,
  variant = 'default',
  emptyState,
  onItemPress,
}: MedicationListProps) {
  const sorted = useMemo(
    () => [...medications].sort(sortAnticoagulantFirst),
    [medications],
  );

  if (sorted.length === 0) {
    return (
      <>{emptyState ?? <EmptyState title="등록된 약이 없어요" />}</>
    );
  }

  const gapClass = variant === 'compact' ? 'gap-1.5' : 'gap-2.5';

  return (
    <View className={gapClass}>
      {sorted.map((med) => (
        <MedicationListItem
          key={med.medication_id ?? med.item_seq}
          medication={med}
          warnings={warnings}
          variant={variant}
          onPress={onItemPress ? () => onItemPress(med) : undefined}
        />
      ))}
    </View>
  );
}
