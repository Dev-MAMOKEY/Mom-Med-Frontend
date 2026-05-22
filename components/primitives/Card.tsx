import { Pressable, View } from 'react-native';
import type { PressableProps, ViewProps } from 'react-native';
import type { ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface BaseCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  bordered?: boolean;
  children?: ReactNode;
}

export type CardProps =
  | (BaseCardProps & { pressable?: false } & Omit<ViewProps, 'style' | 'children'>)
  | (BaseCardProps & { pressable: true } & Omit<PressableProps, 'style' | 'children'>);

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantClass: Record<CardVariant, string> = {
  default: 'bg-surface',
  elevated: 'bg-surface shadow',
  outlined: 'bg-transparent',
};

export function Card(props: CardProps) {
  const {
    variant = 'default',
    padding = 'md',
    bordered = variant === 'outlined',
    children,
  } = props;

  const className = [
    'rounded-lg',
    variantClass[variant],
    paddingClass[padding],
    bordered ? 'border border-border' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (props.pressable) {
    const { variant: _v, padding: _p, bordered: _b, pressable: _pr, children: _c, ...pressableProps } = props;
    return (
      <Pressable className={className} {...pressableProps}>
        {children}
      </Pressable>
    );
  }

  const { variant: _v, padding: _p, bordered: _b, pressable: _pr, children: _c, ...viewProps } = props;
  return (
    <View className={className} {...viewProps}>
      {children}
    </View>
  );
}
