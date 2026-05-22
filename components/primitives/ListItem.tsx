import { Pressable, Text, View } from 'react-native';
import type { PressableProps } from 'react-native';
import type { ReactNode } from 'react';

export type ListItemSize = 'default' | 'compact';

export interface ListItemProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  size?: ListItemSize;
}

const containerBySize: Record<ListItemSize, string> = {
  default: 'py-4 px-4',
  compact: 'py-2 px-3',
};

const titleBySize: Record<ListItemSize, string> = {
  default: 'text-base',
  compact: 'text-sm',
};

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  size = 'default',
  ...pressableProps
}: ListItemProps) {
  return (
    <Pressable
      className={`flex-row items-center bg-surface ${containerBySize[size]}`}
      {...pressableProps}
    >
      {leading && <View className="mr-3">{leading}</View>}

      <View className="flex-1">
        <Text className={`text-text font-semibold ${titleBySize[size]}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-text-mute mt-0.5">{subtitle}</Text>
        )}
      </View>

      {trailing && <View className="ml-3">{trailing}</View>}
    </Pressable>
  );
}
