import { Pressable, Text, View } from 'react-native';
import { Leaf, Pill, Utensils, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import tokens from '@/design-tokens.json';
import type { AllergenType, AllergySeverity } from '@/api/types/common';

export type AllergyTagVariant = 'card' | 'chip';

export interface AllergyTagProps {
  type: AllergenType;
  name: string;
  severity: AllergySeverity;
  notes?: string;
  variant?: AllergyTagVariant;
  onRemove?: () => void;
}

// 알레르겐 타입별 lucide 아이콘 매핑 — 약물/음식/환경
const typeIcon: Record<AllergenType, LucideIcon> = {
  drug: Pill,
  food: Utensils,
  environment: Leaf,
};

// severity별 배경/테두리/뱃지 색상 — F3 문서 매핑 그대로 (severe=danger, moderate=warning, mild=info)
const severityCardClass: Record<AllergySeverity, string> = {
  severe: 'bg-danger-soft border-2 border-danger',
  moderate: 'bg-warning-soft border-2 border-warning',
  mild: 'bg-info-soft border-2 border-info',
};

const severityBadgeClass: Record<AllergySeverity, string> = {
  severe: 'bg-danger',
  moderate: 'bg-warning',
  mild: 'bg-info',
};

const severityChipClass: Record<AllergySeverity, string> = {
  severe: 'bg-danger',
  moderate: 'bg-warning',
  mild: 'bg-info',
};

const removeIconColor = tokens.color.neutral['text-mute'].value;
const cardIconColor = tokens.color.neutral.text.value;
const chipIconColor = '#FFFFFF';

// 알레르기 정보(타입·이름·강도·메모)를 표시하는 카드/칩 — card는 conditions 탭, chip은 F4 응급카드 P1용
export function AllergyTag({
  type,
  name,
  severity,
  notes,
  variant = 'card',
  onRemove,
}: AllergyTagProps) {
  const Icon = typeIcon[type];

  if (variant === 'chip') {
    return (
      <View
        className={`flex-row items-center self-start rounded-md px-2 py-1 gap-1.5 ${severityChipClass[severity]}`}
      >
        <Icon size={12} color={chipIconColor} />
        <Text className="text-xs font-bold text-white">{name}</Text>
      </View>
    );
  }

  return (
    <View className={`rounded-lg p-3 ${severityCardClass[severity]}`}>
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2 flex-1">
          <Icon size={16} color={cardIconColor} />
          <Text className="text-sm font-bold text-text flex-1">{name}</Text>
        </View>
        <View
          className={`rounded-sm px-2 py-0.5 ${severityBadgeClass[severity]}`}
        >
          <Text className="text-xs font-bold text-white">{severity}</Text>
        </View>
        {onRemove && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${name} 삭제`}
            onPress={onRemove}
            hitSlop={8}
            className="ml-2"
          >
            <X size={18} color={removeIconColor} />
          </Pressable>
        )}
      </View>
      {notes && (
        <Text className="text-xs text-text-soft mt-0.5">{notes}</Text>
      )}
    </View>
  );
}
