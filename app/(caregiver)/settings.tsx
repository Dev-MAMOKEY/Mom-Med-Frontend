import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

import { AppMenuButton, Header, ScreenContainer } from '@/components';
import { ListItem } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useCurrentParentStore, useRoleStore, useUserProfileStore } from '@/stores';

const chevronColor = tokens.color.neutral['text-mute'].value;

const Chevron = <ChevronRight size={20} color={chevronColor} />;

// 자녀 시점 설정 화면 — PRD §7 화면 10 + F1 v1.1 (6개 항목 셸)
export default function CaregiverSettings() {
  // 사용자 프로필 — parents.tsx 메뉴 시트와 동일 출처
  const displayName = useUserProfileStore((s) => s.displayName);
  const email = useUserProfileStore((s) => s.email);

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(caregiver)/parents');
  };

  const goAddParent = () => router.push('/(caregiver)/add-parent/phone');

  // 로그아웃 — 역할·현재 부모 컨텍스트 초기화 후 역할 선택으로 복귀
  const onLogout = () => {
    useRoleStore.getState().clear();
    useCurrentParentStore.getState().clear();
    router.replace('/(auth)/role-select');
  };

  // Phase 2 항목 — MVP에선 no-op
  const noop = () => {};

  return (
    <ScreenContainer header={<Header title="설정" showBack onBack={onBack} right={<AppMenuButton />} />}>
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

        <ListItem
          title="데이터·개인정보"
          trailing={Chevron}
          onPress={noop}
        />
        <View className="h-px bg-border ml-4" />

        <ListItem
          title="로그아웃"
          onPress={onLogout}
        />
      </View>

      <View className="bg-surface mt-3 mb-6">
        <ListItem
          title="앱 정보·버전"
          subtitle="v0.1.0"
        />
      </View>
    </ScreenContainer>
  );
}
