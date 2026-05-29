// AppSheet — declarative API의 바텀시트 래퍼. BottomSheet primitive(@gorhom) 기반.
//
// 동작 명세:
//  - open={true}이면 자식 콘텐츠가 표시된다.
//  - open={false}이면 자식이 안 보인다.
//  - (Cycle 2에서) 백드롭 외부 클릭 시 onClose 호출.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-worklets', () => ({}));
jest.mock('react-native-reanimated', () => ({
  default: {},
  useSharedValue: () => ({ value: 0 }),
  useAnimatedStyle: () => ({}),
  withSpring: (v: unknown) => v,
  withTiming: (v: unknown) => v,
  runOnJS: (fn: unknown) => fn,
  Easing: {},
}));

// BottomSheetModal mock — 자식을 항상 렌더해서 RTL 쿼리가 가능하도록.
// (실제 @gorhom는 ref.present 후에 표시되지만, 테스트에선 open prop 기반의 가시성을 검증함)
// backdropComponent prop을 받으면 그것을 호출해서 렌더 → AppSheet가 백드롭 사용하는지 검증 가능.
// bottomInset prop을 testID에 노출 → safe area 적용 검증.
jest.mock('@gorhom/bottom-sheet', () => {
  const RN = require('react-native');
  const ReactLib = require('react');
  return {
    BottomSheetModal: ReactLib.forwardRef(function MockBottomSheetModal(
      {
        children,
        backdropComponent,
        bottomInset,
      }: { children?: unknown; backdropComponent?: unknown; bottomInset?: number },
      ref: unknown
    ) {
      ReactLib.useImperativeHandle(ref, () => ({
        present: () => {},
        dismiss: () => {},
      }));
      const BackdropComp = backdropComponent as React.ComponentType<{ animatedIndex: unknown }> | undefined;
      return ReactLib.createElement(
        RN.View,
        { testID: `bottom-sheet-modal-inset-${bottomInset ?? 'none'}` },
        BackdropComp ? ReactLib.createElement(BackdropComp, { animatedIndex: { value: 0 } }) : null,
        children
      );
    }),
    BottomSheetView: ({ children }: { children?: unknown }) =>
      ReactLib.createElement(RN.View, null, children),
    BottomSheetBackdrop: () =>
      ReactLib.createElement(RN.View, { testID: 'app-sheet-backdrop-marker' }),
    BottomSheetModalProvider: ({ children }: { children?: unknown }) =>
      children ?? null,
    default: () => null,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));

import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { AppSheet } from '@/components/AppSheet';

describe('AppSheet', () => {
  it('open=true 시 자식 콘텐츠가 보인다', () => {
    const { getByText } = render(
      <AppSheet open={true} onClose={() => {}} snapPoints={['40%']}>
        <Text>시트 본문</Text>
      </AppSheet>
    );
    expect(getByText('시트 본문')).toBeTruthy();
  });

  it('시트 본체는 화면 끝까지 닿고 (bottomInset 미전달), 콘텐츠는 inset만큼 paddingBottom으로 회피', () => {
    const { getByTestId } = render(
      <AppSheet open={true} onClose={() => {}} snapPoints={['40%']}>
        <Text>시트 본문</Text>
      </AppSheet>
    );
    // 시트 본체는 인디케이터까지 닿아야 → BottomSheet에 bottomInset 미전달.
    // 그래야 시트 본체 아래 영역에 백드롭이 노출되는 어두운 줄이 안 보임.
    expect(getByTestId('bottom-sheet-modal-inset-none')).toBeTruthy();

    // 콘텐츠 wrapper에 paddingBottom: inset(34)이 적용되어 시트 콘텐츠는 인디케이터 회피.
    const wrapper = getByTestId('app-sheet-content-wrapper');
    const style = Array.isArray(wrapper.props.style)
      ? Object.assign({}, ...wrapper.props.style)
      : wrapper.props.style;
    expect(style.paddingBottom).toBe(34);
  });

  it('외부 클릭 닫기를 위한 backdrop이 BottomSheetModal에 전달된다', () => {
    // BottomSheetBackdrop을 backdropComponent prop으로 넘기는지 확인 — 외부 클릭 닫기의
    // 전제 조건. 실제 백드롭 탭 동작은 e2e(Playwright)에서 검증.
    // mock BottomSheetModal이 backdropComponent prop을 어떤 testID 마커로 노출하도록 강화.
    const { getByTestId } = render(
      <AppSheet open={true} onClose={() => {}} snapPoints={['40%']}>
        <Text>시트 본문</Text>
      </AppSheet>
    );
    expect(getByTestId('app-sheet-backdrop-marker')).toBeTruthy();
  });
});
