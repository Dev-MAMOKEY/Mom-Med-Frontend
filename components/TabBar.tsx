import { Pressable, Text, View } from 'react-native';
import { Bell, Pill, Settings, Stethoscope, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import tokens from '@/design-tokens.json';

export type TabId = string;

export interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface TabBarProps {
  tabs?: TabDef[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  /**
   * 하단 안전영역 inset (px). 미전달 시 useSafeAreaInsets로 디바이스 inset 사용.
   * 테스트·web 시뮬레이션에서 직접 주입 가능.
   */
  bottomInset?: number;
}

// 부모(개인) 시점 + caregiver의 [parentId] 컨텍스트에서 사용하는 4탭.
// dev006: 첫 탭을 home → notifications (Bell)로 변경 — 화면 내용이 "오늘 알림"+다음 약 카드라 "알림"이 의미상 일치.
// dev008: 더보기를 설정으로 교체 — 자녀 시점 부모 선택 탭바(부모님/알림/설정)와의 일관성. more.tsx 컴포넌트 파일은 보존.
const DEFAULT_TABS: TabDef[] = [
  { id: 'notifications', label: '알림', icon: Bell },
  { id: 'meds', label: '약장', icon: Pill },
  { id: 'conditions', label: '질병', icon: Stethoscope },
  { id: 'settings', label: '설정', icon: Settings },
];

// 자녀 시점 탭 — (caregiver) 그룹 루트에서 사용 (목업 화면 2 기준)
export const CAREGIVER_TABS: TabDef[] = [
  { id: 'parents', label: '부모님', icon: Users },
  { id: 'notifications', label: '알림', icon: Bell },
  { id: 'settings', label: '설정', icon: Settings },
];

const activeColor = tokens.color.brand['primary-bold'].value;
const inactiveColor = tokens.color.neutral['text-mute'].value;

// 베이스 높이 64px. 콘텐츠를 컨테이너 중앙보다 살짝 아래에 두기 위해
// paddingTop(12) > 콘텐츠 paddingBottom(4) — 상단 여백이 더 넓어 답답함이 없다.
// safe area inset은 콘텐츠 padding bottom 위에 더해져 인디케이터를 회피한다.
const BASE_HEIGHT = 64;
const CONTENT_PADDING_TOP = 12;
const CONTENT_PADDING_BOTTOM = 4;

export function TabBar({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabPress,
  bottomInset,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  // prop 우선 (web 데모·테스트), 없으면 디바이스 inset.
  const inset = bottomInset ?? insets.bottom;

  return (
    <View
      testID="tab-bar-root"
      // h-16·pb-2 → inline style로 동적 계산해 inset만큼 컨테이너를 늘림.
      // 그래야 흰색 배경이 인디케이터 영역까지 채워지고, 콘텐츠 영역(56px = h-16 - pb-2)은
      // 그대로 보존돼 아이콘·라벨이 압축되지 않는다.
      className="flex-row items-center justify-around bg-surface border-t border-border"
      style={{
        paddingTop: CONTENT_PADDING_TOP,
        paddingBottom: CONTENT_PADDING_BOTTOM + inset,
        height: BASE_HEIGHT + inset,
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = id === activeTab;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onTabPress(id)}
            className="flex-1 items-center justify-center gap-0.5"
          >
            <Icon
              size={22}
              color={active ? activeColor : inactiveColor}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text
              className={
                active
                  ? 'text-xs font-bold text-primary-bold'
                  : 'text-xs text-text-mute'
              }
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
