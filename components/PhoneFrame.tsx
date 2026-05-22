import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';

/**
 * Web demo only: wraps children in an iPhone-shaped frame (390×844, notch + home indicator)
 * so the layout can be shown side-by-side with judges on a desktop browser.
 *
 * Disabled on native (iOS/Android) and on web when EXPO_PUBLIC_SHOW_PHONE_FRAME != 'true'.
 * Inline styles by design — frame chrome uses static device colors that don't belong in
 * design tokens, and avoids pulling NativeWind into a conditionally-rendered web-only wrapper.
 */
const SHOW_FRAME =
  Platform.OS === 'web' && process.env.EXPO_PUBLIC_SHOW_PHONE_FRAME === 'true';

export function PhoneFrame({ children }: PropsWithChildren) {
  if (!SHOW_FRAME) return <>{children}</>;

  return (
    <View style={styles.stage}>
      <View style={styles.device}>
        {/* iOS notch */}
        <View style={styles.notch} />

        {/* Screen content (paddingTop reserves the notch area) */}
        <View style={styles.screen}>{children}</View>

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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
