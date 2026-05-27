import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import tokens from '@/design-tokens.json';
import type { ConditionDrugWarning } from '@/api/types';
import type { Medication } from '@/api/types/medication';
import { isAnticoagulant } from '@/api/types/safety';
import { PillImage } from './PillImage';

export type MedicationListItemVariant = 'default' | 'compact';

export interface MedicationListItemProps {
  medication: Medication;
  warnings?: ConditionDrugWarning[];
  onPress?: () => void;
  variant?: MedicationListItemVariant;
  showAnticoagulantBadge?: boolean;
}

const chevronColor = tokens.color.neutral['text-mute'].value;

// 처방/일반약 라벨
function specialtyLabel(type: Medication['specialty_type']): string | null {
  if (type === 'ETC') return '처방약';
  if (type === 'OTC') return '일반약';
  return null;
}

// 사이즈별 패딩·간격
function containerClass(variant: MedicationListItemVariant, danger: boolean): string {
  const base = 'flex-row items-center bg-surface rounded-lg';
  const padding = variant === 'compact' ? 'p-2' : 'p-3';
  const border = danger ? 'border-2 border-danger' : 'border border-border';
  return `${base} ${padding} ${border}`;
}

// 약장 카드 1행 — 항응고제(ATC B01A*) 자동 빨간 테두리·⚠ 출혈주의 뱃지, 처방/일반·복약 일정 표시
export function MedicationListItem({
  medication,
  warnings,
  onPress,
  variant = 'default',
  showAnticoagulantBadge = true,
}: MedicationListItemProps) {
  const isAntico = isAnticoagulant(medication);
  const highlightDanger = showAnticoagulantBadge && isAntico;
  const specialty = specialtyLabel(medication.specialty_type);
  const hasWarnings = (warnings?.length ?? 0) > 0;
  const isCompact = variant === 'compact';

  const titleClass = isCompact
    ? 'text-sm font-bold text-text'
    : 'text-sm font-bold text-text';
  const subtitleClass = isCompact
    ? 'text-[11px] text-text-soft'
    : 'text-xs text-text-soft';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      className={containerClass(variant, highlightDanger)}
    >
      <View className="mr-3">
        <PillImage
          drugName={medication.item_name}
          size={isCompact ? 'sm' : 'sm'}
        />
      </View>

      <View className="flex-1 min-w-0">
        <Text className={titleClass} numberOfLines={1}>
          {medication.item_name}
        </Text>
        {medication.main_ingr_en && (
          <Text className={subtitleClass} numberOfLines={1}>
            {medication.main_ingr_en}
          </Text>
        )}

        {!isCompact && (
          <View className="flex-row gap-1 mt-1 flex-wrap">
            {highlightDanger && (
              <View className="bg-danger-soft px-1.5 py-0.5 rounded-sm">
                <Text className="text-[10px] font-bold text-danger">⚠ 출혈주의</Text>
              </View>
            )}
            {hasWarnings && !highlightDanger && (
              <View className="bg-warning-soft px-1.5 py-0.5 rounded-sm">
                <Text className="text-[10px] font-bold text-warning">
                  ⚠ 주의 {warnings!.length}
                </Text>
              </View>
            )}
            {specialty === '처방약' && (
              <View className="bg-primary-soft px-1.5 py-0.5 rounded-sm">
                <Text className="text-[10px] font-bold text-primary-bold">처방약</Text>
              </View>
            )}
            {specialty === '일반약' && (
              <View className="bg-info-soft px-1.5 py-0.5 rounded-sm">
                <Text className="text-[10px] font-bold text-info">일반약</Text>
              </View>
            )}
            {medication.dosage_schedule && (
              <View className="bg-surface-alt px-1.5 py-0.5 rounded-sm">
                <Text className="text-[10px] text-text-soft">
                  {medication.dosage_schedule}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {onPress && (
        <View className="ml-2">
          <ChevronRight size={16} color={chevronColor} />
        </View>
      )}
    </Pressable>
  );
}
