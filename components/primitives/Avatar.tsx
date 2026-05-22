import { Image, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

export type AvatarRole = 'parent' | 'caregiver';
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  image?: ImageSourcePropType;
  role?: AvatarRole;
}

const sizeContainer: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const sizeText: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

const roleBg: Record<AvatarRole, string> = {
  parent: 'bg-role-parent',
  caregiver: 'bg-role-caregiver',
};

function initialsFrom(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return trimmed.slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 'md', image, role }: AvatarProps) {
  const containerClass = `rounded-full items-center justify-center overflow-hidden ${sizeContainer[size]} ${role ? roleBg[role] : 'bg-primary-soft'}`;

  if (image) {
    return (
      <View className={containerClass}>
        <Image source={image} className="w-full h-full" resizeMode="cover" />
      </View>
    );
  }

  return (
    <View className={containerClass}>
      <Text className={`font-bold ${sizeText[size]} ${role ? 'text-surface' : 'text-primary-bold'}`}>
        {initialsFrom(name)}
      </Text>
    </View>
  );
}
