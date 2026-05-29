// dev008 슬라이스 1 Cycle 6 — 약 상세 화면의 일정 통합.
// 동작:
//  - "알람 설정" 라벨이 사라지고 "일정 추가" 라벨 노출
//  - 탭 시 ScheduleSheet 열림 (시트의 "복용 일정" 라벨 노출)
//  - useSchedule이 null이면 "아직 일정이 없어요" 안내
//  - useSchedule이 데이터 있으면 슬롯 미리보기 노출

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: { Constants: { BarCodeType: {} } },
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
    BottomSheetModalProvider: ({ children }: { children?: unknown }) =>
      children ?? null,
    default: () => null,
  };
});

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({
    itemSeq: '198800002',
    parentId: 'mom-001',
    medicationId: '42', // BE patient_medications.id (numeric → string)
  }),
  Redirect: () => null,
  useSegments: () => [],
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Stack: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

// hooks mock — 내부 state로 schedule data를 갈아끼울 수 있게 헬퍼 export.
// schedule hook들은 spy로 만들어 호출 시 어떤 키로 호출되는지 검증 가능.
jest.mock('@/hooks', () => {
  const state: { scheduleData: unknown } = { scheduleData: null };
  const deleteMedicationMock = jest.fn(() => Promise.resolve({ success: true }));
  const deleteScheduleMock = jest.fn(() => Promise.resolve());
  const createScheduleSpy = jest.fn(() => ({
    mutateAsync: jest.fn(() => Promise.resolve({})),
    isPending: false,
  }));
  const useScheduleSpy = jest.fn(() => ({ data: state.scheduleData, isLoading: false }));
  return {
    useDrugDetail: () => ({
      data: {
        item_seq: '198800002',
        item_name: '메트포르민 500mg',
        main_ingr_en: 'Metformin',
        atc_code: 'A10BA02',
        specialty_type: 'ETC',
        manufacturer: '대웅제약',
        cautions: [],
      },
      isLoading: false,
      error: null,
    }),
    useSchedule: useScheduleSpy,
    useCreateSchedule: createScheduleSpy,
    useUpdateSchedule: () => ({
      mutateAsync: jest.fn(() => Promise.resolve({})),
      isPending: false,
    }),
    useDeleteSchedule: () => ({
      mutateAsync: deleteScheduleMock,
      isPending: false,
    }),
    useDeleteMedication: () => ({
      mutateAsync: deleteMedicationMock,
      isPending: false,
    }),
    __setScheduleData: (d: unknown) => {
      state.scheduleData = d;
    },
    __deleteMedicationMock: deleteMedicationMock,
    __deleteScheduleMock: deleteScheduleMock,
    __createScheduleSpy: createScheduleSpy,
    __useScheduleSpy: useScheduleSpy,
  };
});

import { router } from 'expo-router';
import MedicationDetail from '@/app/(modals)/medication-detail';

// 모킹된 hooks 모듈에서 헬퍼 가져오기 — 테스트마다 schedule 데이터 갈아끼움.
const hooksMock = jest.requireMock('@/hooks') as {
  __setScheduleData: (d: unknown) => void;
  __deleteMedicationMock: jest.Mock;
  __deleteScheduleMock: jest.Mock;
  __createScheduleSpy: jest.Mock;
  __useScheduleSpy: jest.Mock;
};

beforeEach(() => {
  hooksMock.__setScheduleData(null);
  hooksMock.__deleteMedicationMock.mockClear();
  hooksMock.__deleteScheduleMock.mockClear();
  hooksMock.__createScheduleSpy.mockClear();
  hooksMock.__useScheduleSpy.mockClear();
  (router.back as jest.Mock).mockClear();
});

describe('약 상세 — 일정 진입점', () => {
  it('하단 액션 라벨이 "알람 설정"이 아니라 "일정 추가"이다', () => {
    const { getByText, queryByText } = render(<MedicationDetail />);
    expect(getByText('일정 추가')).toBeTruthy();
    expect(queryByText('알람 설정')).toBeNull();
  });

  it('"일정 추가" 탭 시 ScheduleSheet가 열린다 (등록하기 버튼 노출)', () => {
    const { getByText, queryByText } = render(<MedicationDetail />);
    expect(queryByText('등록하기')).toBeNull(); // 처음엔 시트 닫힘
    fireEvent.press(getByText('일정 추가'));
    expect(getByText('등록하기')).toBeTruthy(); // 시트 열림 (등록 버튼 등장)
  });
});

describe('약 상세 — 일정 hook 키 일관성 (약 삭제 cascade를 위해)', () => {
  it('useSchedule은 itemSeq가 아닌 medicationId(BE id)를 키로 호출된다', () => {
    render(<MedicationDetail />);
    // 약 삭제 시 BE CASCADE / mock cascade는 medicationId를 기준으로 schedule mock을 정리.
    // 따라서 일정 hook들도 같은 키를 써야 일관성 유지.
    expect(hooksMock.__useScheduleSpy).toHaveBeenCalledWith('42');
    expect(hooksMock.__useScheduleSpy).not.toHaveBeenCalledWith('198800002');
  });

  it('useCreateSchedule은 medicationId, parentId, item_name 순으로 초기화된다', () => {
    render(<MedicationDetail />);
    expect(hooksMock.__createScheduleSpy).toHaveBeenCalledWith(
      '42',         // medicationId (BE id) — schedule mock의 키
      'mom-001',    // parentId
      '메트포르민 500mg' // item_name (mock 전용 표시 보조)
    );
  });
});

describe('약 상세 — 약 삭제', () => {
  it('왼쪽 액션 라벨이 "약 삭제"이다 (기존 "삭제"가 아님)', () => {
    const { getByText, queryByText } = render(<MedicationDetail />);
    expect(getByText('약 삭제')).toBeTruthy();
    // 단독 "삭제"는 더 이상 없음 (라벨 충돌 방지)
    expect(queryByText('삭제')).toBeNull();
  });

  it('"약 삭제" 탭 시 itemSeq가 아닌 medicationId(BE id)가 mutateAsync로 전달된다', async () => {
    const { getByText } = render(<MedicationDetail />);
    fireEvent.press(getByText('약 삭제'));
    await Promise.resolve();
    // BE는 patient_medications.id를 받아야 함. itemSeq('198800002')를 넘기면 400.
    expect(hooksMock.__deleteMedicationMock).toHaveBeenCalledWith('42');
    expect(hooksMock.__deleteMedicationMock).not.toHaveBeenCalledWith('198800002');
  });
});

describe('약 상세 — 일정 미리보기', () => {
  it('일정이 없으면 "아직 일정이 없어요" 안내가 보인다', () => {
    const { getByText } = render(<MedicationDetail />);
    expect(getByText(/아직 일정이 없어요/)).toBeTruthy();
  });

  it('일정이 있으면 슬롯 시각 미리보기가 보인다', () => {
    hooksMock.__setScheduleData({
      schedule_id: 'sch_1',
      medication_id: '198800002',
      route: 'oral',
      slots: ['morning', 'evening'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    const { getByText } = render(<MedicationDetail />);
    expect(getByText(/아침/)).toBeTruthy();
    expect(getByText(/저녁/)).toBeTruthy();
  });

  it('일정이 있으면 액션 라벨이 "일정 수정"으로 바뀐다', () => {
    hooksMock.__setScheduleData({
      schedule_id: 'sch_1',
      medication_id: '198800002',
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    const { getByText, queryByText } = render(<MedicationDetail />);
    expect(getByText('일정 수정')).toBeTruthy();
    expect(queryByText('일정 추가')).toBeNull();
  });

  it('일정이 있을 때 시트의 "일정 삭제" 탭 시 useDeleteSchedule.mutateAsync 호출', async () => {
    hooksMock.__setScheduleData({
      schedule_id: 'sch_1',
      medication_id: '198800002',
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    const { getByText } = render(<MedicationDetail />);
    fireEvent.press(getByText('일정 수정')); // 시트 열기
    fireEvent.press(getByText('일정 삭제'));
    await Promise.resolve();
    expect(hooksMock.__deleteScheduleMock).toHaveBeenCalledTimes(1);
  });
});
