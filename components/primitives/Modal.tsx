import { Modal as RNModal, Platform, Pressable, View } from 'react-native';
import type { ReactNode } from 'react';

export type ModalPresentation = 'fullscreen' | 'center' | 'bottomsheet';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  presentation?: ModalPresentation;
  children?: ReactNode;
}

// Web 데모에서 PhoneFrame이 켜져 있으면 RN의 Modal은 DOM의 body 직속(react portal)에
// 마운트돼서 PhoneFrame의 overflow:hidden 클리핑을 빠져나간다. 이 분기에선 absolute
// 오버레이를 같은 트리 안에 그려서 PhoneFrame 안에 머무르도록 한다.
// 모바일 빌드나 PhoneFrame 꺼진 web에서는 기존 RN Modal(OS-level presentation) 유지.
// 매 렌더마다 체크해야 테스트에서 Platform/env 오버라이드가 반영됨.
function isWebFrameMode(): boolean {
  return (
    Platform.OS === 'web' && process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME === 'true'
  );
}

// PhoneFrame의 device wrapper(=testID="phone-frame-device")를 portal target으로 사용.
// 이 element는 PhoneFrame screen의 paddingTop 영역까지 포함하므로, 모달 overlay가
// 노치 회피 padding 영역까지 덮을 수 있다. 마운트가 in-tree로 가면 paddingTop 위쪽이
// 안 덮이는 게 dev004 시점의 버그.
function getPhoneFramePortalTarget(): Element | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector('[data-testid="phone-frame-device"]');
}

export function Modal({
  open,
  onClose,
  presentation = 'center',
  children,
}: ModalProps) {
  // ── Web + PhoneFrame 분기 ──────────────────────────────────────────────
  if (isWebFrameMode()) {
    if (!open) return null;

    // 백드롭에는 accessibilityRole="button"을 두지 않는다. RN-Web에선 그게 <button>으로
    // 렌더되는데, 카드 내부 버튼(Button primitive)도 <button>이라 nested button →
    // HTML invalid + hydration error. 백드롭은 단순 Pressable(div)로.
    let overlay: ReactNode;
    if (presentation === 'fullscreen') {
      overlay = (
        <View
          testID="modal-web-frame-overlay"
          className="absolute inset-0 bg-bg"
        >
          {children}
        </View>
      );
    } else if (presentation === 'bottomsheet') {
      // 하단 부착 시트 — 백드롭(어두운 영역) + 시트 body(아래에서 위로).
      // 시트는 가로 풀폭. 위쪽만 둥근 모서리.
      overlay = (
        <Pressable
          testID="modal-web-frame-overlay"
          onPress={onClose}
          className="absolute inset-0 bg-text/40"
        >
          <Pressable
            testID="modal-web-frame-sheet"
            onPress={(e) => e.stopPropagation()}
            className="absolute left-0 right-0 bottom-0 bg-surface rounded-t-2xl px-5 pt-4 pb-8"
          >
            <View>{children}</View>
          </Pressable>
        </Pressable>
      );
    } else {
      // center
      overlay = (
        <Pressable
          testID="modal-web-frame-overlay"
          onPress={onClose}
          className="absolute inset-0 items-center justify-center bg-text/40 px-6"
        >
          <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-md">
            <View className="bg-surface rounded-xl p-6">{children}</View>
          </Pressable>
        </Pressable>
      );
    }

    // PhoneFrame device가 DOM에 있으면 portal로 그 자식이 되도록 한다 (노치 padding까지 덮음).
    // 못 찾으면 in-tree로 fallback — 기존 동작 유지.
    const portalTarget = getPhoneFramePortalTarget();
    if (portalTarget) {
      // react-dom의 createPortal — react-native-web 환경에서 사용 가능 (RN-Web은 내부적으로 react-dom).
      // jest의 react-test-renderer 환경에선 createPortal이 실제 DOM에 안 닿으므로, 이 경로는
      // 테스트에서 거의 안 잡힘 — 그래서 위 in-tree fallback이 unit test 커버리지.
      // 이 require는 web에서만 평가되므로 모바일 번들에서 react-dom을 끌고 오지 않는다.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createPortal } = require('react-dom') as typeof import('react-dom');
      return createPortal(overlay, portalTarget);
    }
    return overlay;
  }

  // ── 기존 RN Modal 경로 (모바일·Web NoFrame) ─────────────────────────────
  if (presentation === 'fullscreen') {
    return (
      <RNModal
        visible={open}
        onRequestClose={onClose}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-bg">{children}</View>
      </RNModal>
    );
  }

  return (
    <RNModal
      visible={open}
      onRequestClose={onClose}
      animationType="fade"
      transparent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-text/40 px-6"
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-md">
          <View className="bg-surface rounded-xl p-6">{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
