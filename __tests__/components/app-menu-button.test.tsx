// AppMenuButton — 모든 메인 화면 우상단에 부착하는 ☰ 메뉴 버튼 + 시트.
// 시트 내용: 로그인 사용자 프로필 + "역할 변경" 버튼.
// 누르면 시트 열리고, 다시 누르면 닫힘 (토글).
// 역할 변경 → role/parent store clear + /(auth)/role-select 라우팅.

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

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
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: () => null,
  BottomSheetView: () => null,
  BottomSheetBackdrop: () => null,
  BottomSheetModalProvider: ({ children }: { children?: React.ReactNode }) =>
    children ?? null,
  default: () => null,
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  },
  Redirect: () => null,
  useSegments: () => [],
}));

import { router } from 'expo-router';
import { AppMenuButton } from '@/components/AppMenuButton';
import { useCurrentParentStore, useRoleStore } from '@/stores';

describe('AppMenuButton', () => {
  beforeEach(() => {
    useRoleStore.setState({ role: 'caregiver' });
    useCurrentParentStore.getState().setParent('p-1', '어머니');
    (router.replace as jest.Mock).mockClear();
  });

  it('☰ 라벨이 "메뉴"인 버튼이 렌더된다', () => {
    const { getByLabelText } = render(<AppMenuButton />);
    expect(getByLabelText('메뉴')).toBeTruthy();
  });
});
