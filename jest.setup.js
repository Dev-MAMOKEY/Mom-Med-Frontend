// Jest setup — 최소한만. 추가 mock은 각 테스트 파일 내에서 `jest.mock(...)`로 선언하거나
// __mocks__ 디렉토리에 두는 패턴 사용. babel-preset-expo + nativewind가 이 파일도 트랜스폼
// 하므로 jest.mock 팩토리에 무언가 import해서 끌어오는 패턴은 가능한 한 피한다.

// react-native-safe-area-context는 AppSheet/TabBar/ScreenContainer 등 다수 컴포넌트에서
// useSafeAreaInsets를 호출. SafeAreaProvider 없는 jest 환경에서 hook 호출 시 throw.
// 글로벌 mock — SafeAreaInsetsContext는 진짜 React.createContext 기반으로 만들어
// nativewind/css-interop의 wrap 메커니즘이 displayName 등을 안전하게 읽도록 한다.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const DEFAULT_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
  const SafeAreaInsetsContext = React.createContext(DEFAULT_INSETS);
  SafeAreaInsetsContext.displayName = 'SafeAreaInsetsContext';
  return {
    useSafeAreaInsets: () => React.useContext(SafeAreaInsetsContext) ?? DEFAULT_INSETS,
    SafeAreaView: (props) => props.children,
    SafeAreaProvider: (props) => props.children,
    SafeAreaInsetsContext,
  };
});
