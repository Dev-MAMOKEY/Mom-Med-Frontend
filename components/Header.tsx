import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import tokens from '@/design-tokens.json';

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

const iconColor = tokens.color.neutral.text.value;

export function Header({ title, showBack = false, onBack, right }: HeaderProps) {
  return (
    <View className="flex-row items-center gap-3 px-5 py-3 bg-bg">
      {showBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          onPress={onBack}
          hitSlop={8}
        >
          <ChevronLeft size={28} color={iconColor} />
        </Pressable>
      )}

      <Text
        numberOfLines={1}
        className="flex-1 text-base font-bold text-text"
      >
        {title}
      </Text>

      {right && <View>{right}</View>}
    </View>
  );
}
