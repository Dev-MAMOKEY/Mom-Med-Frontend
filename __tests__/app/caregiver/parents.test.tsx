// parents.tsx — 자녀 시점 부모 목록 화면.
// 동작 명세:
//  - 우상단에 "메뉴" accessibilityLabel을 가진 버튼이 렌더된다 (기존 "설정"이 아님).
//  - 메뉴 탭 시 사용자 프로필(이름·이메일)과 "역할 변경" 버튼이 표시된다.
//  - "역할 변경" 탭 시 role/currentParent 클리어 + role-select 화면으로 이동.
//
// 위치 메모: expo-router가 `app/` 폴더의 *.test.tsx를 라우트로 잡으려다 깨지므로
// `app/` 밖 `__tests__/` 트리에 둔다. 구현은 `@/...` alias로 참조.

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// 네이티브 모듈 의존 — Jest 노드 환경에서 못 뜨므로 스텁
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
// @gorhom mock — present/dismiss 호출에 반응해서 자식 가시성 토글.
// 이렇게 해야 "열린 상태에서만 자식 보임" 가시성 동작을 테스트로 검증 가능.
jest.mock('@gorhom/bottom-sheet', () => {
  const RN = require('react-native');
  const ReactLib = require('react');
  return {
    BottomSheetModal: ReactLib.forwardRef(function MockBottomSheetModal(
      { children }: { children?: unknown },
      ref: unknown
    ) {
      const [presented, setPresented] = ReactLib.useState(false);
      ReactLib.useImperativeHandle(ref, () => ({
        present: () => setPresented(true),
        dismiss: () => setPresented(false),
      }));
      return presented ? ReactLib.createElement(RN.View, null, children) : null;
    }),
    BottomSheetView: ({ children }: { children?: unknown }) =>
      ReactLib.createElement(RN.View, null, children),
    BottomSheetBackdrop: () => null,
    BottomSheetModalProvider: ({ children }: { children?: unknown }) =>
      children ?? null,
    default: () => null,
  };
});

// router mock — 라우팅 호출 추적
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) },
  Redirect: () => null,
  useSegments: () => [],
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Stack: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

// 부모 목록 훅 — 기본 빈 배열, __setParents 헬퍼로 테스트별 갈아끼움.
jest.mock('@/hooks', () => {
  const state: { parents: unknown[] } = { parents: [] };
  return {
    useParents: () => ({ data: { parents: state.parents }, isLoading: false }),
    __setParents: (parents: unknown[]) => { state.parents = parents; },
  };
});

import { router } from 'expo-router';
import CaregiverParents from '@/app/(caregiver)/parents';
import { useCurrentParentStore, useRoleStore } from '@/stores';

const hooksMock = jest.requireMock('@/hooks') as { __setParents: (p: unknown[]) => void };

describe('CaregiverParents — 부모 등록된 상태 (텍스트 라벨)', () => {
  const parents = [
    { parent_id: 'p1', display_name: '어머니', birthdate: '1954-03-15', age: 72, address_sido: '대구광역시', address_sigungu: '중구', medication_count: 0, alert_count: 0, conditions: [] },
    { parent_id: 'p2', display_name: '아버지', birthdate: '1951-08-22', age: 74, address_sido: '대구광역시', address_sigungu: '중구', medication_count: 0, alert_count: 0, conditions: [] },
  ];

  beforeEach(() => {
    hooksMock.__setParents(parents);
  });

  afterAll(() => {
    hooksMock.__setParents([]);
  });

  it('헤더 텍스트가 "부모님 약 관리하기"이다 ("관리하는 부모님" 아님)', () => {
    const { getByText, queryByText } = render(<CaregiverParents />);
    expect(getByText('부모님 약 관리하기')).toBeTruthy();
    expect(queryByText('관리하는 부모님')).toBeNull();
  });

  it('"총 N분 등록되어 있어요" 부제 텍스트가 더 이상 노출되지 않는다', () => {
    const { queryByText } = render(<CaregiverParents />);
    expect(queryByText(/등록되어 있어요/)).toBeNull();
  });

  it('등록 버튼 라벨이 "+ 등록하기"이다 ("+ 부모님 등록하기" 아님)', () => {
    const { getByText, queryByText } = render(<CaregiverParents />);
    expect(getByText('+ 등록하기')).toBeTruthy();
    expect(queryByText('+ 부모님 등록하기')).toBeNull();
  });

  // nativewind/css-interop가 Pressable의 함수형 style을 wrap해 외부 직접 검증은 어려움.
  // 대신 style 계산 함수를 별도 export해 동작만 단위 테스트로 가드.
  it('addParentButtonStyle: hover→opacity 0.9, press→opacity 0.8, 기본→null', () => {
    const { addParentButtonStyle } = jest.requireActual('@/app/(caregiver)/parents');
    expect(addParentButtonStyle({ hovered: false, pressed: false })).toBeNull();
    expect(addParentButtonStyle({ hovered: true, pressed: false })).toEqual({ opacity: 0.9 });
    expect(addParentButtonStyle({ hovered: false, pressed: true })).toEqual({ opacity: 0.8 });
    // pressed가 hovered보다 우선
    expect(addParentButtonStyle({ hovered: true, pressed: true })).toEqual({ opacity: 0.8 });
  });
});

describe('CaregiverParents 화면', () => {
  it('우상단에 "메뉴" 버튼이 노출된다', () => {
    const { getByLabelText, queryByLabelText } = render(<CaregiverParents />);
    expect(getByLabelText('메뉴')).toBeTruthy();
    expect(queryByLabelText('설정')).toBeNull();
  });

  it('처음에는 사용자 프로필 정보가 보이지 않는다', () => {
    const { queryByText } = render(<CaregiverParents />);
    expect(queryByText('홍길동')).toBeNull();
    expect(queryByText('demo@mommed.app')).toBeNull();
  });

  it('메뉴 버튼을 누르면 사용자 프로필 정보가 표시된다', () => {
    const { getByLabelText, getByText } = render(<CaregiverParents />);
    fireEvent.press(getByLabelText('메뉴'));
    expect(getByText('홍길동')).toBeTruthy();
    expect(getByText('demo@mommed.app')).toBeTruthy();
  });

  it('메뉴를 열면 "역할 변경" 버튼이 노출된다', () => {
    const { getByLabelText, queryByText } = render(<CaregiverParents />);
    expect(queryByText('역할 변경')).toBeNull(); // 닫힌 상태에서는 안 보임
    fireEvent.press(getByLabelText('메뉴'));
    expect(queryByText('역할 변경')).toBeTruthy();
  });

  it('메뉴 버튼이 토글로 동작한다 — 같은 버튼 다시 누르면 닫힘', () => {
    const { getByLabelText, queryByText } = render(<CaregiverParents />);
    const menuBtn = getByLabelText('메뉴');

    fireEvent.press(menuBtn);
    expect(queryByText('역할 변경')).toBeTruthy(); // 열림

    fireEvent.press(menuBtn);
    expect(queryByText('역할 변경')).toBeNull(); // 다시 누르면 닫힘
  });

  describe('"역할 변경" 버튼 동작', () => {
    beforeEach(() => {
      // 초기 상태 — 자녀로 로그인된 듯이 세팅
      useRoleStore.setState({ role: 'caregiver' });
      useCurrentParentStore.getState().setParent('p-1', '어머니');
      (router.replace as jest.Mock).mockClear();
    });

    it('role과 currentParent를 클리어하고 역할 선택 화면으로 이동한다', () => {
      const { getByLabelText, getByText } = render(<CaregiverParents />);
      fireEvent.press(getByLabelText('메뉴'));
      fireEvent.press(getByText('역할 변경'));

      expect(useRoleStore.getState().role).toBeNull();
      expect(useCurrentParentStore.getState().parentId).toBeNull();
      expect(router.replace).toHaveBeenCalledWith('/(auth)/role-select');
    });
  });
});
