import { Text, View } from 'react-native';

export type BadgeSemantic = 'success' | 'warning' | 'danger' | 'info';
export type BadgeSeverity = '관심' | '주의' | '경고' | '위험';
export type BadgeVariant = BadgeSemantic | BadgeSeverity;
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  size?: BadgeSize;
}

const semanticClass: Record<BadgeSemantic, string> = {
  success: 'bg-success-soft',
  warning: 'bg-warning-soft',
  danger: 'bg-danger-soft',
  info: 'bg-info-soft',
};

const semanticTextClass: Record<BadgeSemantic, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

const severityClass: Record<BadgeSeverity, string> = {
  관심: 'bg-severity-관심',
  주의: 'bg-severity-주의',
  경고: 'bg-severity-경고',
  위험: 'bg-severity-위험',
};

const sizeContainer: Record<BadgeSize, string> = {
  sm: 'px-2 py-px rounded-sm',
  md: 'px-3 py-1 rounded-sm',
};

const sizeText: Record<BadgeSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

const isSeverity = (v: BadgeVariant): v is BadgeSeverity =>
  v === '관심' || v === '주의' || v === '경고' || v === '위험';

export function Badge({ label, variant, size = 'md' }: BadgeProps) {
  const containerClass = isSeverity(variant)
    ? severityClass[variant]
    : semanticClass[variant];

  const textColorClass = isSeverity(variant)
    ? 'text-surface'
    : semanticTextClass[variant];

  return (
    <View className={`self-start ${sizeContainer[size]} ${containerClass}`}>
      <Text className={`font-semibold ${sizeText[size]} ${textColorClass}`}>
        {label}
      </Text>
    </View>
  );
}
