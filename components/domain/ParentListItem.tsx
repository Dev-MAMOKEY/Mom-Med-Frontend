import { Pressable, Text, View } from 'react-native';

import type { Parent } from '@/api/types/parent';
import { Avatar, Badge } from '@/components/primitives';

export interface ParentListItemProps {
  parent: Parent;
  onPress: (parent: Parent) => void;
}

function formatAddress(sido: string, sigungu?: string): string {
  return sigungu ? `${sido} ${sigungu}` : sido;
}

export function ParentListItem({ parent, onPress }: ParentListItemProps) {
  const subtitle = `${parent.age}세 · ${formatAddress(parent.address_sido, parent.address_sigungu)}`;
  const showAlert = parent.alert_count > 0;
  const showMedication = parent.medication_count > 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(parent)}
      className="w-full bg-surface border border-border rounded-xl p-4 shadow-sm"
    >
      <View className="flex-row items-center gap-3 mb-3">
        <Avatar name={parent.display_name} size="lg" />
        <View className="flex-1">
          <Text className="text-base font-bold text-text">{parent.display_name}</Text>
          <Text className="text-xs text-text-soft mt-0.5">{subtitle}</Text>
        </View>
        {showAlert && (
          <Badge label={`알림 ${parent.alert_count}`} variant="danger" size="sm" />
        )}
      </View>

      {showMedication && (
        <View className="flex-row gap-2">
          <View className="bg-primary-soft rounded-sm px-2.5 py-1">
            <Text className="text-xs font-semibold text-primary-bold">
              약 {parent.medication_count}개
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
