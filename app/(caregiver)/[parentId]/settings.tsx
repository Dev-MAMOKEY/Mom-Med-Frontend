import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { ListItem } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useCurrentParentStore, useRoleStore, useUserProfileStore } from '@/stores';

const chevronColor = tokens.color.neutral['text-mute'].value;
const Chevron = <ChevronRight size={20} color={chevronColor} />;

// 부모 컨텍스트 안 설정 화면 — (caregiver)/settings와 동일한 항목.
// 헤더(ParentSwitcher + AppMenuButton)는 [parentId]/_layout이 제공하므로 본문만.
// dev008: 탭바 더보기 → 설정 교체와 함께 신설.
export default function ParentScopedSettings() {
  const displayName = useUserProfileStore((s) => s.displayName);
  const email = useUserProfileStore((s) => s.email);

  const goAddParent = () => router.push('/(caregiver)/add-parent/phone');

  const onLogout = () => {
    useRoleStore.getState().clear();
    useCurrentParentStore.getState().clear();
    router.replace('/(auth)/role-select');
  };

  const noop = () => {};

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="pb-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="bg-surface mt-3">
        <ListItem
          title="내 프로필"
          subtitle={`${displayName} · ${email}`}
          trailing={Chevron}
          onPress={noop}
        />
        <View className="h-px bg-border ml-4" />

        <ListItem
          title="부모님 등록하기"
          trailing={Chevron}
          onPress={goAddParent}
        />
        <View className="h-px bg-border ml-4" />

        <ListItem
          title="알림 설정"
          subtitle="준비 중"
          trailing={Chevron}
          onPress={noop}
        />
        <View className="h-px bg-border ml-4" />

        <ListItem title="데이터·개인정보" trailing={Chevron} onPress={noop} />
        <View className="h-px bg-border ml-4" />

        <ListItem title="로그아웃" onPress={onLogout} />
      </View>

      <View className="bg-surface mt-3">
        <ListItem title="앱 정보·버전" subtitle="v0.1.0" />
      </View>
    </ScrollView>
  );
}
