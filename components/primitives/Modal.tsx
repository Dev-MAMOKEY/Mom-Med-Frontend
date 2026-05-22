import { Modal as RNModal, Pressable, View } from 'react-native';
import type { ReactNode } from 'react';

export type ModalPresentation = 'fullscreen' | 'center';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  presentation?: ModalPresentation;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  presentation = 'center',
  children,
}: ModalProps) {
  if (presentation === 'fullscreen') {
    return (
      <RNModal
        visible={open}
        onRequestClose={onClose}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-bg">{children}</View>
      </RNModal>
    );
  }

  return (
    <RNModal
      visible={open}
      onRequestClose={onClose}
      animationType="fade"
      transparent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-text/40 px-6"
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-md">
          <View className="bg-surface rounded-xl p-6">{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
