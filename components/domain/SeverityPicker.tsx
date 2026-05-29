import { Pressable, Text, View } from 'react-native';

import type { AllergySeverity } from '@/api/types/common';
import { SEVERITY_LABELS } from '@/utils/severity';

export interface SeverityPickerProps {
  value: AllergySeverity;
  onChange: (severity: AllergySeverity) => void;
}

// 옵션별 라벨/점 색상 — 한국어 라벨만 노출 (dev010, SEVERITY_LABELS SSOT 재사용)
const options: ReadonlyArray<{
  value: AllergySeverity;
  label: string;
  dot: string;
}> = [
  { value: 'mild', label: SEVERITY_LABELS.mild, dot: 'bg-info' },
  { value: 'moderate', label: SEVERITY_LABELS.moderate, dot: 'bg-warning' },
  { value: 'severe', label: SEVERITY_LABELS.severe, dot: 'bg-danger' },
];

// 선택 강조 색상 매핑 (선택된 항목에만 적용)
const selectedContainer: Record<AllergySeverity, string> = {
  mild: 'bg-info-soft border-2 border-info',
  moderate: 'bg-warning-soft border-2 border-warning',
  severe: 'bg-danger-soft border-2 border-danger',
};

const selectedLabel: Record<AllergySeverity, string> = {
  mild: 'text-info',
  moderate: 'text-warning',
  severe: 'text-danger',
};

// 알레르기 강도(mild/moderate/severe) 3단계 선택 칩 — 가로 균등 분할
export function SeverityPicker({ value, onChange }: SeverityPickerProps) {
  return (
    <View className="flex-row gap-2">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const containerClass = isSelected
          ? selectedContainer[opt.value]
          : 'bg-surface border border-border';
        const labelClass = isSelected
          ? `font-bold ${selectedLabel[opt.value]}`
          : 'font-semibold text-text';

        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.value)}
            className={`flex-1 items-center rounded-md py-3 ${containerClass}`}
          >
            <View className={`w-3 h-3 rounded-full mb-1 ${opt.dot}`} />
            <Text className={`text-sm ${labelClass}`}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
