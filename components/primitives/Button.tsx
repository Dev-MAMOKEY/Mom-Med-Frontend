import { ActivityIndicator, Pressable, Text } from 'react-native';
import type { PressableProps } from 'react-native';

import tokens from '@/design-tokens.json';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
}

const containerByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-primary-bold',
  secondary: 'bg-primary-soft border border-primary-200',
  danger: 'bg-danger',
  ghost: 'bg-transparent',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'text-surface',
  secondary: 'text-primary-bold',
  danger: 'text-surface',
  ghost: 'text-primary-bold',
};

const containerBySize: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 rounded-md',
  md: 'py-3 px-6 rounded-md',
  lg: 'py-4 px-6 rounded-md',
};

const labelBySize: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

const surfaceColor = tokens.color.neutral.surface.value;
const primaryBoldColor = tokens.color.brand['primary-bold'].value;

const spinnerColor: Record<ButtonVariant, string> = {
  primary: surfaceColor,
  secondary: primaryBoldColor,
  danger: surfaceColor,
  ghost: primaryBoldColor,
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${containerBySize[size]} ${containerByVariant[variant]} ${isDisabled ? 'opacity-50' : ''}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor[variant]} />
      ) : (
        <Text className={`font-bold ${labelBySize[size]} ${labelByVariant[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
