// dev008 후속 — 하단 네비게이션에 안전영역(safe area) 적용.
// 사용자가 다양한 기기(노치, 홈 인디케이터 등)에서 탭 라벨이 가려지지 않아야 한다.
//
// 컴포넌트 단위 검증은 prop으로 직접 inset 주입 — useSafeAreaInsets는 hook 통합이라
// SafeAreaProvider 의존이라 별도 e2e/디바이스 검증.

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import { render } from '@testing-library/react-native';
import React from 'react';

import { TabBar } from '@/components/TabBar';

describe('TabBar 안전영역 적용', () => {
  it('상단 여백(paddingTop)이 12px로 충분히 확보된다 (콘텐츠가 border-t에 붙지 않음)', () => {
    const { getByTestId } = render(
      <TabBar activeTab="notifications" onTabPress={() => {}} bottomInset={34} />
    );
    const root = getByTestId('tab-bar-root');
    const style = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;
    expect(style.paddingTop).toBe(12);
  });

  it('하단 콘텐츠 여백은 4px + inset만큼만 (콘텐츠가 컨테이너 중앙보다 살짝 아래)', () => {
    const { getByTestId } = render(
      <TabBar activeTab="notifications" onTabPress={() => {}} bottomInset={34} />
    );
    const root = getByTestId('tab-bar-root');
    const style = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;
    // 4 (콘텐츠 padding) + 34 (inset) = 38 — 기존 42에서 4px 줄어듦.
    expect(style.paddingBottom).toBe(38);
  });

  it('bottomInset만큼 컨테이너 height가 늘어난다 (콘텐츠 영역 보존)', () => {
    const { getByTestId } = render(
      <TabBar activeTab="notifications" onTabPress={() => {}} bottomInset={34} />
    );
    const root = getByTestId('tab-bar-root');
    const style = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;
    // 베이스 64 + inset 34 = 98 → 흰색 배경이 인디케이터까지 채워짐.
    expect(style.height).toBe(98);
  });

  it('bottomInset 미전달 시에도 testID는 노출 (fallback paddingBottom 0 또는 hook 값)', () => {
    const { getByTestId } = render(
      <TabBar activeTab="notifications" onTabPress={() => {}} />
    );
    expect(getByTestId('tab-bar-root')).toBeTruthy();
  });
});
