import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import tokens from '@/design-tokens.json';

export type RoleSelectCardVariant = 'outlined' | 'solid';

export interface RoleSelectCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onPress: () => void;
  variant?: RoleSelectCardVariant;
}

const primaryBoldColor = tokens.color.brand['primary-bold'].value;
const surfaceColor = tokens.color.neutral.surface.value;

export function RoleSelectCard({
  title,
  description,
  icon,
  onPress,
  variant = 'outlined',
}: RoleSelectCardProps) {
  const isSolid = variant === 'solid';

  const containerClass = isSolid
    ? 'w-full bg-primary rounded-xl p-5 shadow-md'
    : 'w-full bg-surface border-2 border-primary rounded-xl p-5 shadow-sm';

  const iconWrapClass = isSolid
    ? 'w-14 h-14 rounded-full bg-white/20 items-center justify-center'
    : 'w-14 h-14 rounded-full bg-primary-soft items-center justify-center';

  const titleClass = isSolid
    ? 'text-lg font-bold text-surface'
    : 'text-lg font-bold text-text';

  const descClass = isSolid
    ? 'text-xs text-white/85 mt-0.5'
    : 'text-xs text-text-soft mt-0.5';

  const chevronColor = isSolid ? surfaceColor : primaryBoldColor;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={containerClass}
    >
      <View className="flex-row items-center gap-4">
        <View className={iconWrapClass}>{icon}</View>
        <View className="flex-1">
          <Text className={titleClass}>{title}</Text>
          <Text className={descClass}>{description}</Text>
        </View>
        <ChevronRight size={20} color={chevronColor} />
      </View>
    </Pressable>
  );
}
