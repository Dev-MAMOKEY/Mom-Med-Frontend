// dev008 슬라이스 1 Cycle 8 — caregiver 부모 컨텍스트 알림 화면 재작성.
// 동작:
//  - 기존 "오늘 알림이 없어요" 헤더 + "다음 약" 카드는 사라진다
//  - 날짜·시각 헤더 + 어제·오늘·내일 토글 + 시간순 정렬된 IntakeCard 리스트
//  - "먹음" 탭 시 useCheckIntake가 호출된다

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    usePermissions: () => [{ granted: false }, jest.fn(() => Promise.resolve({ granted: false }))],
    Constants: { BarCodeType: {} },
  },
}));
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
    BottomSheetModalProvider: ({ children }: { children?: unknown }) => children ?? null,
    default: () => null,
  };
});

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ parentId: 'mom-001' }),
  Redirect: () => null,
  useSegments: () => [],
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Stack: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

jest.mock('@/hooks', () => {
  const state: { intakes: unknown[] } = { intakes: [] };
  const checkIntakeMock = jest.fn(() => Promise.resolve({}));
  return {
    useMedicationsWithSafety: () => ({
      data: { list: { medications: [] }, safety: { overall_decision: 'ALLOW', evidences: [] } },
      isLoading: false,
    }),
    useAddMedicationFlow: () => ({
      onAddMedication: jest.fn(),
      Components: null,
    }),
    useTodayIntakes: () => ({
      data: { date: '2026-05-30', intakes: state.intakes },
      isLoading: false,
    }),
    useCheckIntake: () => ({ mutate: checkIntakeMock, mutateAsync: checkIntakeMock }),
    __setIntakes: (i: unknown[]) => { state.intakes = i; },
    __checkIntakeMock: checkIntakeMock,
  };
});

import ParentNotifications from '@/app/(caregiver)/[parentId]/notifications';

const hooksMock = jest.requireMock('@/hooks') as {
  __setIntakes: (i: unknown[]) => void;
  __checkIntakeMock: jest.Mock;
};

beforeEach(() => {
  hooksMock.__setIntakes([]);
  hooksMock.__checkIntakeMock.mockClear();
});

describe('알림 화면 — 헤더 교체', () => {
  it('"오늘 알림이 없어요" 텍스트가 더 이상 노출되지 않는다', () => {
    const { queryByText } = render(<ParentNotifications />);
    expect(queryByText('오늘 알림이 없어요')).toBeNull();
  });

  it('"다음 약" placeholder 카드가 더 이상 노출되지 않는다', () => {
    const { queryByText } = render(<ParentNotifications />);
    expect(queryByText('다음 약')).toBeNull();
  });

  it('어제 · 오늘 · 내일 날짜 토글이 노출된다', () => {
    const { getByText } = render(<ParentNotifications />);
    expect(getByText('어제')).toBeTruthy();
    expect(getByText('오늘')).toBeTruthy();
    expect(getByText('내일')).toBeTruthy();
  });

  it('"약 추가" 버튼이 더 이상 노출되지 않는다', () => {
    const { queryByText, queryByLabelText } = render(<ParentNotifications />);
    expect(queryByText('약 추가')).toBeNull();
    expect(queryByLabelText('약 추가')).toBeNull();
  });
});

describe('알림 화면 — 슬롯 그룹 리스트', () => {
  it('intakes가 있으면 IntakeCard가 슬롯별로 노출된다', () => {
    hooksMock.__setIntakes([
      {
        intake_id: 'i_1',
        schedule_id: 'sch_1',
        medication_id: 'med_1',
        item_name: '메트포르민 500mg',
        route: 'oral',
        slot: 'morning',
        scheduled_at: '2026-05-30T08:00:00',
        status: 'pending',
      },
      {
        intake_id: 'i_2',
        schedule_id: 'sch_2',
        medication_id: 'med_2',
        item_name: '점안액',
        route: 'eye',
        slot: 'evening',
        scheduled_at: '2026-05-30T18:00:00',
        status: 'pending',
      },
    ]);

    const { getByText } = render(<ParentNotifications />);
    expect(getByText(/메트포르민/)).toBeTruthy();
    expect(getByText(/점안액/)).toBeTruthy();
  });

  it('intake 카드의 "먹음" 탭 시 useCheckIntake.mutate가 호출된다', () => {
    hooksMock.__setIntakes([
      {
        intake_id: 'i_1',
        schedule_id: 'sch_1',
        medication_id: 'med_1',
        item_name: '메트포르민 500mg',
        route: 'oral',
        slot: 'morning',
        scheduled_at: '2026-05-30T08:00:00',
        status: 'pending',
      },
    ]);

    const { getByText } = render(<ParentNotifications />);
    fireEvent.press(getByText('먹음'));
    expect(hooksMock.__checkIntakeMock).toHaveBeenCalledTimes(1);
    const call = hooksMock.__checkIntakeMock.mock.calls[0][0] as { intakeId: string };
    expect(call.intakeId).toBe('i_1');
  });
});
