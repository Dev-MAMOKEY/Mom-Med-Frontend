import { Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

import tokens from '@/design-tokens.json';

export type ConditionTagVariant = 'card' | 'chip';

export interface ConditionTagProps {
  code: string;
  name: string;
  variant?: ConditionTagVariant;
  onRemove?: () => void;
}

const removeIconColor = tokens.color.neutral['text-mute'].value;

// 질병 코드(KCD) + 한글명을 표시하는 카드/칩 — card는 conditions 탭, chip은 F4 응급카드용
export function ConditionTag({
  code,
  name,
  variant = 'card',
  onRemove,
}: ConditionTagProps) {
  if (variant === 'chip') {
    return (
      <View className="flex-row items-center self-start bg-info-soft rounded-md px-2 py-1 gap-1.5">
        <Text className="text-xs font-bold text-info">{code}</Text>
        <Text className="text-xs font-semibold text-text">{name}</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3 bg-surface border border-border rounded-lg p-3">
      <View className="bg-info-soft rounded-md px-2 py-1">
        <Text className="text-xs font-bold text-info">{code}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-text">{name}</Text>
      </View>
      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name} 삭제`}
          onPress={onRemove}
          hitSlop={8}
        >
          <X size={18} color={removeIconColor} />
        </Pressable>
      )}
    </View>
  );
}
