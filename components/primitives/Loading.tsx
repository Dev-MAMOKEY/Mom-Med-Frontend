import { ActivityIndicator, Text, View } from 'react-native';

import tokens from '@/design-tokens.json';

export type LoadingSize = 'sm' | 'md' | 'lg';

export interface LoadingProps {
  size?: LoadingSize;
  text?: string;
}

const indicatorSize: Record<LoadingSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

const textClassBySize: Record<LoadingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const spinnerColor = tokens.color.brand['primary-bold'].value;

export function Loading({ size = 'md', text }: LoadingProps) {
  return (
    <View className="items-center justify-center py-4">
      <ActivityIndicator size={indicatorSize[size]} color={spinnerColor} />
      {text && (
        <Text className={`text-text-mute mt-2 ${textClassBySize[size]}`}>
          {text}
        </Text>
      )}
    </View>
  );
}
