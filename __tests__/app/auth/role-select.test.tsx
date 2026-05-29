// role-select.tsx — 부모/자녀 카드 2개 화면.
// 동작 명세:
//  - "내 약장" 카드 탭 시 (parent home placeholder는 갇혀있어 위험) 즉시 라우팅하지 않고
//    "개발 중" 안내 모달을 띄운다.
//  - "자녀로 들어가기"는 기존대로 정상 동작 (이 파일에서는 검증하지 않음 — 기존 흐름).

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

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) },
  Redirect: () => null,
  useSegments: () => [],
}));

// 배럴 import가 BarcodeScanner → expo-barcode-scanner 네이티브 모듈까지 끌고 오므로 stub.
// RoleSelectCard만 가벼운 Pressable로 대체 — 테스트는 라벨 텍스트와 onPress만 필요.
jest.mock('@/components/domain', () => {
  const RN = require('react-native');
  const ReactLocal = require('react');
  return {
    RoleSelectCard: ({ title, description, onPress }: { title: string; description: string; onPress: () => void }) =>
      ReactLocal.createElement(
        RN.Pressable,
        { accessibilityRole: 'button', onPress },
        ReactLocal.createElement(RN.Text, null, title),
        ReactLocal.createElement(RN.Text, null, description)
      ),
  };
});

import { router } from 'expo-router';
import RoleSelect from '@/app/(auth)/role-select';
import { useRoleStore } from '@/stores';

describe('RoleSelect 화면', () => {
  beforeEach(() => {
    useRoleStore.setState({ role: null });
    (router.replace as jest.Mock).mockClear();
    (router.push as jest.Mock).mockClear();
  });

  it('앱 브랜드 타이틀이 "Yakjugo"이다 ("엄마약" 아님)', () => {
    const { getByText, queryByText } = render(<RoleSelect />);
    expect(getByText('Yakjugo')).toBeTruthy();
    expect(queryByText('엄마약')).toBeNull();
  });

  it('"내 약장" 카드를 탭해도 parent home으로 즉시 라우팅하지 않는다', () => {
    const { getByText } = render(<RoleSelect />);
    fireEvent.press(getByText('내 약장'));

    expect(router.replace).not.toHaveBeenCalledWith('/(parent)/home');
    expect(router.push).not.toHaveBeenCalledWith('/(parent)/home');
  });

  it('처음에는 "개발 중" 안내가 보이지 않는다', () => {
    const { queryByText } = render(<RoleSelect />);
    expect(queryByText('개발 중이에요')).toBeNull();
  });

  it('"내 약장" 탭 시 "개발 중이에요" 안내가 표시된다', () => {
    const { getByText, queryByText } = render(<RoleSelect />);
    fireEvent.press(getByText('내 약장'));
    expect(queryByText('개발 중이에요')).toBeTruthy();
  });

  it('안내 모달의 "확인" 버튼을 누르면 안내가 사라진다', () => {
    const { getByText, queryByText } = render(<RoleSelect />);
    fireEvent.press(getByText('내 약장'));
    expect(queryByText('개발 중이에요')).toBeTruthy();

    fireEvent.press(getByText('확인'));
    expect(queryByText('개발 중이에요')).toBeNull();
  });

  it('"내 약장" 탭 후 확인을 눌러도 role은 null로 유지된다', () => {
    const { getByText } = render(<RoleSelect />);
    fireEvent.press(getByText('내 약장'));
    fireEvent.press(getByText('확인'));

    // role이 'parent'로 persist되면 다음에 진입할 때 가드가 자동으로 parent home으로
    // 보내버려 갇히는 화면에서 못 나옴 — 절대 set되지 않아야 함.
    expect(useRoleStore.getState().role).toBeNull();
  });

  it('"자녀로 들어가기" 탭 시 /(caregiver)/parents로 라우팅된다', () => {
    // 회귀 가드: useState를 early redirect 가드 뒤에 두면 setRole('caregiver') 직후
    // 재렌더링에서 가드가 일찍 return → hook 카운트 불일치로 화면이 깨졌음.
    const { getByText } = render(<RoleSelect />);
    fireEvent.press(getByText('자녀로 들어가기'));

    expect(useRoleStore.getState().role).toBe('caregiver');
    expect(router.replace).toHaveBeenCalledWith('/(caregiver)/parents');
  });
});
