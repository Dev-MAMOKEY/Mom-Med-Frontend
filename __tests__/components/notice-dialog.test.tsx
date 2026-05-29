// NoticeDialog — Modal primitive 위에 얹은 안내 팝업.
// 동작 명세:
//  - open=false면 본문/버튼 모두 안 보임
//  - open=true면 title 노출 + primary 버튼 노출 (탭 시 onPress 발화)
//  - secondaryAction이 있으면 두 번째 버튼 노출 (탭 시 onPress 발화)
//  - description은 옵셔널

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// barrel(@/components/primitives)이 BottomSheet → @gorhom → reanimated를 끌어오므로 stub.
jest.mock('react-native-worklets', () => ({}));
jest.mock('react-native-reanimated', () => ({
  default: {},
  useSharedValue: () => ({ value: 0 }),
  useAnimatedStyle: () => ({}),
  useAnimatedReaction: () => undefined,
  withSpring: (v: unknown) => v,
  withTiming: (v: unknown) => v,
  runOnJS: (fn: unknown) => fn,
  Easing: {},
}));
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: () => null,
  BottomSheetView: () => null,
  BottomSheetBackdrop: () => null,
  BottomSheetModalProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
  default: () => null,
}));

import { NoticeDialog } from '@/components/NoticeDialog';

describe('NoticeDialog', () => {
  it('open=false면 title이 보이지 않는다', () => {
    const { queryByText } = render(
      <NoticeDialog
        open={false}
        onClose={() => {}}
        title="공사 중이에요"
        primaryAction={{ label: '확인', onPress: () => {} }}
      />
    );
    expect(queryByText('공사 중이에요')).toBeNull();
  });

  it('open=true면 title과 primary 버튼이 보이고, 버튼 탭 시 onPress가 호출된다', () => {
    const onPrimary = jest.fn();
    const { getByText } = render(
      <NoticeDialog
        open={true}
        onClose={() => {}}
        title="공사 중이에요"
        primaryAction={{ label: '확인', onPress: onPrimary }}
      />
    );

    expect(getByText('공사 중이에요')).toBeTruthy();
    fireEvent.press(getByText('확인'));
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it('secondaryAction이 전달되면 두 번째 버튼이 노출되고, 탭 시 onPress가 호출된다', () => {
    const onSecondary = jest.fn();
    const { getByText, queryByText } = render(
      <NoticeDialog
        open={true}
        onClose={() => {}}
        title="권한이 필요해요"
        primaryAction={{ label: '권한 요청', onPress: () => {} }}
        secondaryAction={{ label: '직접 입력으로 진행', onPress: onSecondary }}
      />
    );

    expect(queryByText('직접 입력으로 진행')).toBeTruthy();
    fireEvent.press(getByText('직접 입력으로 진행'));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('secondaryAction이 없으면 두 번째 버튼이 노출되지 않는다', () => {
    const { queryByText } = render(
      <NoticeDialog
        open={true}
        onClose={() => {}}
        title="권한이 필요해요"
        primaryAction={{ label: '권한 요청', onPress: () => {} }}
      />
    );
    expect(queryByText('직접 입력으로 진행')).toBeNull();
  });
});
