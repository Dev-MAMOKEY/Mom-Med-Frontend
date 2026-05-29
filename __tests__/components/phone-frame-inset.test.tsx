// PhoneFrame이 web 데모 모드에서 자식 컴포넌트에 iPhone 시뮬레이션 inset을 제공.
// 실제 모바일 디바이스에선 root SafeAreaProvider가 OS 측정값을 주지만,
// web 데모는 시각적 PhoneFrame 안에서 inset 0이 되므로 시뮬레이션 필요.

// 글로벌 mock(jest.setup.js)을 풀어 실제 SafeAreaInsetsContext 사용.
jest.unmock('react-native-safe-area-context');

import React, { useContext } from 'react';
import { Platform, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { PhoneFrame } from '@/components/PhoneFrame';

function InsetInspector() {
  const insets = useContext(SafeAreaInsetsContext);
  return (
    <Text testID="inset-display">
      {insets ? `b=${insets.bottom} t=${insets.top}` : 'none'}
    </Text>
  );
}

describe('PhoneFrame 시뮬레이션 inset', () => {
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

  it('web+frame 모드에서 자식에게 bottom=28, top=0 inset을 제공한다 (시각 균형 조정값)', () => {
    const { getByTestId } = render(
      <PhoneFrame>
        <InsetInspector />
      </PhoneFrame>
    );
    expect(getByTestId('inset-display').props.children).toBe('b=28 t=0');
  });
});
