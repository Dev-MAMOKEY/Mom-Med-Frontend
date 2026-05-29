import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import tokens from '@/design-tokens.json';
import { AppSheet } from '@/components/AppSheet';
import { Avatar } from '@/components/primitives';

export interface ParentSummary {
  parent_id: string;
  display_name: string;
}

export interface ParentSwitcherProps {
  currentParentId: string;
  parents: ParentSummary[];
  onSwitch: (parentId: string) => void;
}

const muteColor = tokens.color.neutral['text-mute'].value;
const primaryBoldColor = tokens.color.brand['primary-bold'].value;

// 헤더 부모 선택 드롭다운 — 탭 시 AppSheet로 부모 목록 표시, 선택 시 onSwitch + 시트 닫기.
// dev007: BottomSheet primitive 직접 사용 → AppSheet 마이그레이션. 외부 클릭/드래그로 자동 닫힘.
export function ParentSwitcher({
  currentParentId,
  parents,
  onSwitch,
}: ParentSwitcherProps) {
  const [isOpen, setOpen] = useState(false);
  const snapPoints = useMemo(() => ['40%'], []);

  const current = parents.find((p) => p.parent_id === currentParentId);
  const displayName = current?.display_name ?? '부모 선택';

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const handleSelect = (parentId: string) => {
    onSwitch(parentId);
    close();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={open}
        className="flex-row items-center gap-2"
      >
        <Avatar name={displayName} size="sm" role="parent" />
        <Text className="text-lg font-extrabold text-text">{displayName}</Text>
        <ChevronDown size={16} color={muteColor} />
      </Pressable>

      <AppSheet open={isOpen} onClose={close} snapPoints={snapPoints}>
        <View className="px-5 pt-2 pb-6">
          <Text className="text-base font-bold text-text mb-3">약장 선택</Text>
          {parents.map((p) => {
            const selected = p.parent_id === currentParentId;
            return (
              <Pressable
                key={p.parent_id}
                accessibilityRole="button"
                onPress={() => handleSelect(p.parent_id)}
                className={`flex-row items-center gap-3 py-3 px-2 rounded-md ${selected ? 'bg-primary-soft' : ''}`}
              >
                <Avatar name={p.display_name} size="md" role="parent" />
                <Text
                  className={`flex-1 text-base ${selected ? 'font-bold text-primary-bold' : 'text-text'}`}
                >
                  {p.display_name}
                </Text>
                {selected && <Check size={18} color={primaryBoldColor} />}
              </Pressable>
            );
          })}
        </View>
      </AppSheet>
    </>
  );
}
