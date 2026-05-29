// 약 삭제 액션 — USE_MOCK 분기와 무관하게 FE schedule mock cleanup을 보장하는지.
// 사용자가 마주친 버그: USE_MOCK=false(실 BE) 모드에서 약을 삭제해도 알림 화면의 일정이
// 새로고침 전까지 남아 있었음. 원인 = BE 분기에서 mockDeleteSchedule이 호출되지 않음.

jest.mock('@/api', () => ({
  apiCall: jest.fn(() => Promise.resolve(undefined)),
}));

import { performDeleteMedication } from '@/hooks/useDeleteMedication';
import {
  mockCreateSchedule,
  mockGetSchedule,
  resetScheduleMocks,
} from '@/mocks/schedule';

const PARENT = 'mom-001';
const MED = '42'; // BE patient_medications.id

beforeEach(() => {
  resetScheduleMocks();
});

describe('performDeleteMedication', () => {
  it('USE_MOCK=false 모드에서도 약 삭제 시 FE schedule mock이 cascade로 정리된다', async () => {
    // 사전: 일정 등록 (medicationId 먼저, parentId 다음)
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    expect(await mockGetSchedule(MED)).not.toBeNull();

    // 약 삭제 액션 (USE_MOCK=false — BE 호출 분기)
    await performDeleteMedication(PARENT, MED);

    // FE schedule mock에서도 같이 사라져야 알림 화면이 즉시 갱신됨
    expect(await mockGetSchedule(MED)).toBeNull();
  });
});
