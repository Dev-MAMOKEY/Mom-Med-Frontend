// Modal primitive — Web + PhoneFrame 모드에서의 동작 검증.
//
// 동작 명세:
//  - Web에서 PhoneFrame이 켜져 있으면, 모달은 absolute 오버레이로 in-tree 렌더된다.
//  - 그래서 부모 컨테이너(PhoneFrame)의 overflow:hidden 클리핑 안에 머무른다.
//  - 모바일/Web+NoFrame에서는 기존 RN Modal 경로(OS-level portal) 유지.
//
// Jest는 시각적 클리핑을 검증할 수 없으므로, "Web+Frame 분기에서는 모달 본문이
// 일반 React 자식 트리로 렌더된다"는 사실(=portal 안 씀)을 통해 간접 검증한다.
// 구체적으로는 모달 컨테이너에 testID="modal-web-frame-overlay"를 두고 그것이
// 평범한 getByTestId로 잡히는지로 확인.

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

// Platform.OS는 통째 mock하면 css-interop/safe-area-context 등 다른 라이브러리들이
// 깨지므로, in-place로 OS 속성만 web으로 덮어쓴다.
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

// 배럴 import는 BottomSheet → gesture-handler까지 끌어오므로 직접 경로 사용
import { Modal } from '@/components/primitives/Modal';

describe('Modal — Web+PhoneFrame 분기', () => {
  it('open=true 시 absolute 오버레이로 본문이 렌더된다', () => {
    const { getByTestId, getByText } = render(
      <Modal open={true} onClose={() => {}} presentation="center">
        <Text>본문 텍스트</Text>
      </Modal>
    );

    // 새 분기 표식 — 이 testID가 잡히면 absolute 오버레이 경로 사용 중.
    expect(getByTestId('modal-web-frame-overlay')).toBeTruthy();
    expect(getByText('본문 텍스트')).toBeTruthy();
  });

  // 노트: portal mount(=phone-frame-device의 DOM 자식이 되는지) 검증은
  // react-test-renderer 환경에서 실제 DOM에 렌더되지 않아 까다로움. Playwright e2e로
  // 검증한다 (overlay 위치가 PhoneFrame의 paddingTop 영역까지 덮는지 좌표 확인).

  it('presentation="bottomsheet" 시 시트 body에 별도 testID가 부착된다', () => {
    const { getByTestId, getByText } = render(
      <Modal open={true} onClose={() => {}} presentation="bottomsheet">
        <Text>시트 본문</Text>
      </Modal>
    );

    // bottomsheet variant 식별용 — 시트 본문이 화면 하단에 부착됨을 의미
    expect(getByTestId('modal-web-frame-sheet')).toBeTruthy();
    expect(getByText('시트 본문')).toBeTruthy();
  });
});
