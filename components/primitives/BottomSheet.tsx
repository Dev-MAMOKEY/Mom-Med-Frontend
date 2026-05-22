import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import GorhomBottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetProps as GorhomProps } from '@gorhom/bottom-sheet';

import tokens from '@/design-tokens.json';

export interface BottomSheetProps
  extends Omit<GorhomProps, 'children' | 'backgroundStyle' | 'handleIndicatorStyle'> {
  children?: ReactNode;
}

const surfaceColor = tokens.color.neutral.surface.value;
const handleColor = tokens.color.neutral.border.value;

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  ({ children, index = -1, snapPoints, ...rest }, ref) => {
    return (
      <GorhomBottomSheet
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: surfaceColor }}
        handleIndicatorStyle={{ backgroundColor: handleColor }}
        {...rest}
      >
        <BottomSheetView>{children}</BottomSheetView>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export type BottomSheetRef = GorhomBottomSheet;
