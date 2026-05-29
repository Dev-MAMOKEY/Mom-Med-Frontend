// dev008 슬라이스 1 Cycle 7 — SlotGroupHeader.
// 슬롯 그룹 위에 노출되는 헤더: 이모지·라벨·시각. 알림 화면의 슬롯별 묶음.

import { render } from '@testing-library/react-native';
import React from 'react';

import { SlotGroupHeader } from '@/components/domain/SlotGroupHeader';

describe('SlotGroupHeader', () => {
  it('아침 슬롯이면 "아침"과 "08:00"이 보인다', () => {
    const { getByText } = render(<SlotGroupHeader slot="morning" />);
    expect(getByText(/아침/)).toBeTruthy();
    expect(getByText(/08:00/)).toBeTruthy();
  });

  it('취침 슬롯이면 "취침"과 "22:00"이 보인다', () => {
    const { getByText } = render(<SlotGroupHeader slot="bedtime" />);
    expect(getByText(/취침/)).toBeTruthy();
    expect(getByText(/22:00/)).toBeTruthy();
  });
});
