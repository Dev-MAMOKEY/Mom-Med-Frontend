import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModalProps } from '@gorhom/bottom-sheet';

import tokens from '@/design-tokens.json';

// BottomSheetModal 기반 — 부모 컨테이너 크기와 무관하게 portal로 풀스크린 위에 렌더된다.
// GorhomBottomSheet(non-modal)는 부모 높이를 snapPoints 계산에 사용해 좁은 컨테이너 안에서 깨졌음.
// 루트 _layout의 BottomSheetModalProvider가 portal 마운트 지점.
export interface BottomSheetProps
  extends Omit<BottomSheetModalProps, 'children' | 'backgroundStyle' | 'handleIndicatorStyle'> {
  children?: ReactNode;
}

const surfaceColor = tokens.color.neutral.surface.value;
const handleColor = tokens.color.neutral.border.value;

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  ({ children, snapPoints, ...rest }, ref) => {
    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        // @gorhom v5 기본 enableDynamicSizing=true는 콘텐츠 크기로 시트를 줄임.
        // snapPoints 명시한 사용처가 의도와 다르게 짧아지므로 기본 false로. rest로 override 가능.
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: surfaceColor }}
        handleIndicatorStyle={{ backgroundColor: handleColor }}
        {...rest}
      >
        <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export type BottomSheetRef = BottomSheetModal;
