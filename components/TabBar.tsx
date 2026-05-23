import { Pressable, Text, View } from 'react-native';
import { Bell, Home, MoreHorizontal, Pill, Settings, Stethoscope, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

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
}

// 부모(개인) 시점 기본 탭 — demo 화면 및 (parent) 그룹에서 사용
const DEFAULT_TABS: TabDef[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'meds', label: '약장', icon: Pill },
  { id: 'conditions', label: '질병', icon: Stethoscope },
  { id: 'more', label: '더보기', icon: MoreHorizontal },
];

// 자녀 시점 탭 — (caregiver) 그룹 루트에서 사용 (목업 화면 2 기준)
export const CAREGIVER_TABS: TabDef[] = [
  { id: 'parents', label: '부모님', icon: Users },
  { id: 'notifications', label: '알림', icon: Bell },
  { id: 'settings', label: '설정', icon: Settings },
];

const activeColor = tokens.color.brand['primary-bold'].value;
const inactiveColor = tokens.color.neutral['text-mute'].value;

export function TabBar({ tabs = DEFAULT_TABS, activeTab, onTabPress }: TabBarProps) {
  return (
    <View className="flex-row items-center justify-around bg-surface border-t border-border h-16 pb-2">
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
