// dev008 슬라이스 1 Cycle 5 — ScheduleSheet 컴포넌트 핵심 동작.
// 사용자가 시트를 열고 → 약 종류·슬롯·주기를 고른 뒤 → 등록하기를 누르면
// 우리 BE 정의에 맞는 payload가 onSubmit으로 흘러나가야 한다.

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

// AppSheet 안의 @gorhom BottomSheetModal — 자식을 항상 렌더해서 RTL이 시트 콘텐츠 쿼리 가능하게.
jest.mock('@gorhom/bottom-sheet', () => {
  const RN = require('react-native');
  const ReactLib = require('react');
  return {
    BottomSheetModal: ReactLib.forwardRef(function MockBottomSheetModal(
      { children, backdropComponent }: { children?: unknown; backdropComponent?: unknown },
      ref: unknown
    ) {
      ReactLib.useImperativeHandle(ref, () => ({
        present: () => {},
        dismiss: () => {},
      }));
      const Backdrop = backdropComponent as React.ComponentType<{ animatedIndex: unknown }> | undefined;
      return ReactLib.createElement(
        RN.View,
        null,
        Backdrop ? ReactLib.createElement(Backdrop, { animatedIndex: { value: 0 } }) : null,
        children
      );
    }),
    BottomSheetView: ({ children }: { children?: unknown }) =>
      ReactLib.createElement(RN.View, null, children),
    BottomSheetBackdrop: () => null,
    BottomSheetModalProvider: ({ children }: { children?: unknown }) => children ?? null,
    default: () => null,
  };
});

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ScheduleSheet } from '@/components/domain/ScheduleSheet';
import type { CreateScheduleReq } from '@/api/types/schedule';

describe('ScheduleSheet 열림 상태', () => {
  it('아침·점심·저녁·취침 4슬롯 라벨이 보인다', () => {
    const { getByText } = render(
      <ScheduleSheet open onClose={() => {}} onSubmit={() => {}} />
    );
    expect(getByText('아침')).toBeTruthy();
    expect(getByText('점심')).toBeTruthy();
    expect(getByText('저녁')).toBeTruthy();
    expect(getByText('취침')).toBeTruthy();
  });

  it('약 종류 4개 라벨이 보인다', () => {
    const { getByText } = render(
      <ScheduleSheet open onClose={() => {}} onSubmit={() => {}} />
    );
    expect(getByText('먹는약')).toBeTruthy();
    expect(getByText('안약')).toBeTruthy();
    expect(getByText('연고')).toBeTruthy();
    expect(getByText('주사')).toBeTruthy();
  });
});

describe('ScheduleSheet 폼 입력', () => {
  it('슬롯을 두 개 선택하고 등록하면 onSubmit이 BE-호환 payload로 호출된다', () => {
    const onSubmit = jest.fn();
    const { getByText, getByAccessibilityHint } = render(
      <ScheduleSheet
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        defaultStartedOn="2026-05-30"
      />
    );

    // 슬롯: 아침 + 저녁
    fireEvent.press(getByAccessibilityHint('아침 슬롯 선택'));
    fireEvent.press(getByAccessibilityHint('저녁 슬롯 선택'));

    // 주기: daily (default) — 별도 클릭 불필요
    // 약 종류: oral (default)

    fireEvent.press(getByText('등록하기'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const req = onSubmit.mock.calls[0][0] as CreateScheduleReq;
    expect(req.route).toBe('oral');
    expect(req.slots.sort()).toEqual(['evening', 'morning']);
    expect(req.frequency_type).toBe('daily');
    expect(req.started_on).toBe('2026-05-30');
    expect(req.meal_offset_min).toBe(0);
  });

  it('슬롯이 0개면 등록 버튼이 비활성 (onSubmit 호출 안 됨)', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <ScheduleSheet open onClose={() => {}} onSubmit={onSubmit} />
    );
    fireEvent.press(getByText('등록하기'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ScheduleSheet — 일정 삭제 (수정 모드만)', () => {
  it('생성 모드(initialValues 없음)에서는 "일정 삭제" 버튼이 없다', () => {
    const { queryByText } = render(
      <ScheduleSheet open onClose={() => {}} onSubmit={() => {}} onDelete={() => {}} />
    );
    expect(queryByText('일정 삭제')).toBeNull();
  });

  it('수정 모드(initialValues 있음 + onDelete 전달)에서 "일정 삭제" 버튼이 보이고 탭 시 onDelete 호출', () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <ScheduleSheet
        open
        onClose={() => {}}
        onSubmit={() => {}}
        onDelete={onDelete}
        initialValues={{
          route: 'oral',
          slots: ['morning'],
          frequency_type: 'daily',
          started_on: '2026-05-30',
          meal_offset_min: 0,
        }}
      />
    );
    fireEvent.press(getByText('일정 삭제'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('initialValues는 있어도 onDelete prop이 없으면 버튼이 안 보인다', () => {
    const { queryByText } = render(
      <ScheduleSheet
        open
        onClose={() => {}}
        onSubmit={() => {}}
        initialValues={{
          route: 'oral',
          slots: ['morning'],
          frequency_type: 'daily',
          started_on: '2026-05-30',
          meal_offset_min: 0,
        }}
      />
    );
    expect(queryByText('일정 삭제')).toBeNull();
  });
});

describe('ScheduleSheet 초기값', () => {
  it('initialValues가 있으면 그것으로 폼이 채워진다 (수정 모드)', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <ScheduleSheet
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        defaultStartedOn="2026-05-30"
        initialValues={{
          route: 'eye',
          slots: ['noon'],
          frequency_type: 'daily',
          started_on: '2026-05-30',
          meal_offset_min: 0,
        }}
      />
    );
    // 점심 슬롯이 이미 선택 → 등록하면 noon 포함된 payload
    fireEvent.press(getByText('등록하기'));
    const req = onSubmit.mock.calls[0][0] as CreateScheduleReq;
    expect(req.route).toBe('eye');
    expect(req.slots).toEqual(['noon']);
  });
});
