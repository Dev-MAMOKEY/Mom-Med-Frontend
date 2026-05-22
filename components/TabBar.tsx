import { Pressable, Text, View } from 'react-native';
import { Home, MoreHorizontal, Pill, Stethoscope } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import tokens from '@/design-tokens.json';

export type TabId = 'home' | 'meds' | 'conditions' | 'more';

export interface TabBarProps {
  activeTab: TabId;
  onTabPress: (tab: TabId) => void;
}

interface TabDef {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: TabDef[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'meds', label: '약장', icon: Pill },
  { id: 'conditions', label: '질병', icon: Stethoscope },
  { id: 'more', label: '더보기', icon: MoreHorizontal },
];

const activeColor = tokens.color.brand['primary-bold'].value;
const inactiveColor = tokens.color.neutral['text-mute'].value;

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View className="flex-row items-center justify-around bg-surface border-t border-border h-16 pb-2">
      {TABS.map(({ id, label, icon: Icon }) => {
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
