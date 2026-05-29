// 공모전 심사위원 시연용 가이드 패널 — PhoneFrame 왼쪽에 데모 약 카탈로그와
// BLOCK 시연 흐름을 노출.

jest.unmock('react-native-safe-area-context');

import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import React from 'react';

import { PhoneFrame } from '@/components/PhoneFrame';

describe('PhoneFrame 시연 가이드', () => {
  const originalOS = Platform.OS;
  const originalEnv = process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME;

  beforeAll(() => {
    (Platform as { OS: string }).OS = 'web';
    process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME = 'true';
  });

  afterAll(() => {
    (Platform as { OS: string }).OS = originalOS;
    process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME = originalEnv;
  });

  it('데모 약 카탈로그 (메트포르민·이오헥솔)가 노출된다', () => {
    const { getAllByText } = render(<PhoneFrame>{null}</PhoneFrame>);
    expect(getAllByText(/메트포르민/).length).toBeGreaterThan(0);
    expect(getAllByText(/이오헥솔/).length).toBeGreaterThan(0);
  });

  it('BLOCK 시연 흐름 안내(병용금지)가 노출된다', () => {
    const { getAllByText } = render(<PhoneFrame>{null}</PhoneFrame>);
    expect(getAllByText(/BLOCK|병용금지/).length).toBeGreaterThan(0);
  });

  it('식약처 고시 출처가 노출된다 (시연 신뢰도)', () => {
    const { getAllByText } = render(<PhoneFrame>{null}</PhoneFrame>);
    expect(getAllByText(/식약처 고시|20110188/).length).toBeGreaterThan(0);
  });
});
