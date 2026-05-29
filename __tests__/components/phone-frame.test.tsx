// PhoneFrame — web 데모용 폰 목업.
// 동작 명세:
//  - SHOW_PHONE_FRAME=true on web 시 device wrapper에 testID="phone-frame-device"가 부착된다.
//    이 마커는 Modal primitive가 portal target으로 찾아갈 element를 식별하기 위함.
//  - SHOW_PHONE_FRAME 꺼지면 frame 자체가 안 그려짐 — 이건 기존 동작이라 별도 검증 안 함.

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

import { render } from '@testing-library/react-native';
import React from 'react';
import { Platform, Text } from 'react-native';

const ORIGINAL_OS = Platform.OS;
const ORIGINAL_FRAME = process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME;
beforeAll(() => {
  (Platform as { OS: string }).OS = 'web';
  process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME = 'true';
});
afterAll(() => {
  (Platform as { OS: string }).OS = ORIGINAL_OS;
  if (ORIGINAL_FRAME === undefined) {
    delete process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME;
  } else {
    process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME = ORIGINAL_FRAME;
  }
});

import { PhoneFrame } from '@/components/PhoneFrame';

describe('PhoneFrame — web', () => {
  it('device wrapper에 testID="phone-frame-device" 마커가 부착된다', () => {
    const { getByTestId } = render(
      <PhoneFrame>
        <Text>content</Text>
      </PhoneFrame>
    );
    // Modal primitive가 이 testID로 portal target 검색.
    expect(getByTestId('phone-frame-device')).toBeTruthy();
  });
});
