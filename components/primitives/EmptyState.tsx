import { Text, View } from 'react-native';
import { Inbox } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import tokens from '@/design-tokens.json';
import { Button } from './Button';
import type { ButtonVariant } from './Button';

export interface EmptyStateCTA {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  cta?: EmptyStateCTA;
}

const iconColor = tokens.color.neutral['text-mute'].value;

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  cta,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <View className="w-16 h-16 rounded-full bg-surface-alt items-center justify-center mb-4">
        <Icon size={32} color={iconColor} />
      </View>

      <Text className="text-lg font-bold text-text text-center">{title}</Text>

      {description && (
        <Text className="text-sm text-text-mute text-center mt-2">
          {description}
        </Text>
      )}

      {cta && (
        <View className="mt-6">
          <Button
            label={cta.label}
            onPress={cta.onPress}
            variant={cta.variant ?? 'primary'}
          />
        </View>
      )}
    </View>
  );
}
