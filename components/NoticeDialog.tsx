import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button, Modal } from './primitives';

export interface NoticeDialogAction {
  label: string;
  onPress: () => void;
}

export interface NoticeDialogProps {
  open: boolean;
  onClose: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction: NoticeDialogAction;
  secondaryAction?: NoticeDialogAction;
}

// Modal primitive 위에 얹은 작은 안내 팝업 (center presentation) — role-select의
// "개발 중이에요" 패턴을 일반화. 아이콘+제목+본문+버튼 구성.
export function NoticeDialog({
  open,
  onClose,
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: NoticeDialogProps) {
  return (
    <Modal open={open} onClose={onClose} presentation="center">
      <View className="items-center">
        {icon && (
          <View className="w-14 h-14 rounded-full bg-primary-soft items-center justify-center mb-4">
            {icon}
          </View>
        )}
        <Text className="text-lg font-bold text-text text-center">{title}</Text>
        {description && (
          <Text className="text-sm text-text-soft text-center mt-2">
            {description}
          </Text>
        )}
      </View>
      <View className="mt-6 gap-2">
        <Button
          label={primaryAction.label}
          variant="primary"
          size="md"
          onPress={primaryAction.onPress}
        />
        {secondaryAction && (
          <Button
            label={secondaryAction.label}
            variant="ghost"
            size="md"
            onPress={secondaryAction.onPress}
          />
        )}
      </View>
    </Modal>
  );
}
