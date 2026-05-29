import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { DemoLegend } from './DemoLegend';

// Web 데모 시뮬레이션 inset — TabBar/AppSheet의 하단 콘텐츠 padding이 인디케이터에
// 너무 멀리 떨어져 보였던 점을 보정한 값. iOS 표준 34에서 살짝 줄여 시각 균형을 잡음.
// 모바일 빌드에선 root SafeAreaProvider가 실제 디바이스 inset(보통 34pt)을 제공.
const PHONE_FRAME_INSETS = { top: 0, bottom: 28, left: 0, right: 0 } as const;

/**
 * Web demo only: wraps children in an iPhone-shaped frame (390×844, notch + home indicator)
 * so the layout can be shown side-by-side with judges on a desktop browser.
 *
 * Disabled on native (iOS/Android) and on web when EXPO_PUBLIC_SHOW_PHONE_FRAME != 'true'.
 * Inline styles by design — frame chrome uses static device colors that don't belong in
 * design tokens, and avoids pulling NativeWind into a conditionally-rendered web-only wrapper.
 */
// 매 렌더마다 평가 — 테스트에서 Platform/env 오버라이드 반영을 위함.
// 모듈 로드 시 1회 평가하면 jest beforeAll이 너무 늦어 항상 false가 됨.
function shouldShowFrame(): boolean {
  return (
    Platform.OS === 'web' && process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME === 'true'
  );
}

export function PhoneFrame({ children }: PropsWithChildren) {
  if (!shouldShowFrame()) return <>{children}</>;

  return (
    <View style={styles.stage}>
      {/* 공모전 시연 가이드 — 폰 왼쪽에 데모 약 카탈로그 + BLOCK 시연 흐름.
          PhoneFrame이 떠 있는 web 데모 모드에서만 노출되므로 자연스럽게 모바일 빌드에선 제외. */}
      <DemoLegend />

      {/* testID는 Modal primitive가 portal target으로 찾기 위한 마커.
          RN-Web에서 testID → data-testid 속성으로 변환됨. */}
      <View testID="phone-frame-device" style={styles.device}>
        {/* iOS notch */}
        <View style={styles.notch} />

        {/* Screen content (paddingTop reserves the notch area).
            SafeAreaInsetsContext.Provider로 시뮬레이션 inset 주입 — 자식의 useSafeAreaInsets가
            iPhone 표준 값을 받아 TabBar/AppSheet가 홈 인디케이터를 자연스럽게 회피.
            Web demo 한정이라 native 빌드에선 root SafeAreaProvider 값(OS 측정)이 적용됨. */}
        <View style={styles.screen}>
          <SafeAreaInsetsContext.Provider value={PHONE_FRAME_INSETS}>
            {children}
          </SafeAreaInsetsContext.Provider>
        </View>

        {/* Home indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = {
  stage: {
    // '100vh' is web-only and not in RN's DimensionValue type, but this branch
    // only renders on web where react-native-web forwards the string to CSS.
    minHeight: '100vh' as unknown as number,
    backgroundColor: '#F0EBE2',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 32,
  },
  device: {
    width: 390,
    height: 844,
    backgroundColor: '#FAF7F2',
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#1c1c1e',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    height: 28,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    zIndex: 50,
  },
  screen: {
    flex: 1,
    paddingTop: 47,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -65 }],
    width: 130,
    height: 5,
    backgroundColor: '#2D2419',
    borderRadius: 3,
    opacity: 0.3,
    zIndex: 50,
  },
} as const;
