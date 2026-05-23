import { router } from 'expo-router';
import { Settings, Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { Parent } from '@/api/types/parent';
import { Header, ScreenContainer } from '@/components';
import { ParentListItem } from '@/components/domain/ParentListItem';
import { EmptyState, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useParents } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

const settingsIconColor = tokens.color.neutral['text-soft'].value;

// 자녀 시점 — 관리하는 부모 목록 화면 (목업 화면 2)
export default function CaregiverParents() {
  const { data, isLoading } = useParents();
  const parents = data?.parents ?? [];

  // 부모 카드 탭 → 현재 부모 컨텍스트 설정 + 해당 부모 약장으로 이동
  const onParentPress = (parent: Parent) => {
    useCurrentParentStore.getState().setParent(parent.parent_id, parent.display_name);
    router.push({ pathname: '/(caregiver)/[parentId]/home', params: { parentId: parent.parent_id } });
  };

  // 우상단 설정 아이콘 → 설정 화면
  const goSettings = () => router.push('/(caregiver)/settings');

  // 하단 등록 버튼 → 부모 등록 플로우 (phone 화면)
  const goAddParent = () => router.push('/(caregiver)/add-parent/phone');

  const SettingsButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="설정"
      onPress={goSettings}
      hitSlop={8}
      className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
    >
      <Settings size={20} color={settingsIconColor} />
    </Pressable>
  );

  return (
    <ScreenContainer
      header={<Header title="관리하는 부모님" right={SettingsButton} />}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Loading text="부모님 목록을 불러오는 중..." />
        </View>
      ) : parents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="등록된 부모님이 없어요"
          description="첫 번째 부모님을 등록해보세요"
          cta={{ label: '+ 부모님 등록하기', onPress: goAddParent }}
        />
      ) : (
        <View className="px-5 pt-1 pb-6">
          <Text className="text-sm text-text-soft mb-3">
            총 {parents.length}분 등록되어 있어요
          </Text>

          <View className="gap-3">
            {parents.map((parent) => (
              <ParentListItem
                key={parent.parent_id}
                parent={parent}
                onPress={onParentPress}
              />
            ))}

            <Pressable
              accessibilityRole="button"
              onPress={goAddParent}
              className="border-2 border-dashed border-primary-300 rounded-xl p-4 items-center justify-center"
            >
              <Text className="text-base font-semibold text-primary-bold">
                + 부모님 등록하기
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
