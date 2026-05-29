import { router } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppSheet } from '@/components/AppSheet';
import tokens from '@/design-tokens.json';
import { useCurrentParentStore, useRoleStore, useUserProfileStore } from '@/stores';

const menuIconColor = tokens.color.neutral['text-soft'].value;

// 앱 전역 메뉴 버튼 — 모든 메인 화면 우상단에 부착.
// 누르면 하단 시트 열림 (프로필 + 역할 변경). 다시 누르면 토글로 닫힘.
// dev007: Modal 대신 AppSheet 사용 — @gorhom 기반 슬라이드 애니메이션 + 외부 클릭/드래그로 닫기.
export function AppMenuButton() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const displayName = useUserProfileStore((s) => s.displayName);
  const email = useUserProfileStore((s) => s.email);

  // snapPoints는 매 렌더마다 새 배열 만들지 않도록 메모화
  const snapPoints = useMemo(() => ['40%'], []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // 역할 변경 — role/현재부모 컨텍스트 클리어 후 역할 선택 화면으로.
  // role-select.tsx의 가드(`if role === 'caregiver' → Redirect`) 통과 위해 role 비워야 함.
  const onChangeRole = () => {
    setMenuOpen(false);
    useRoleStore.getState().clear();
    useCurrentParentStore.getState().clear();
    router.replace('/(auth)/role-select');
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="메뉴"
        onPress={toggleMenu}
        hitSlop={8}
        className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
      >
        <Menu size={20} color={menuIconColor} />
      </Pressable>

      <AppSheet open={isMenuOpen} onClose={closeMenu} snapPoints={snapPoints}>
        <View className="px-5 pt-2 pb-6">
          <Text className="text-base font-bold text-text mb-3">내 정보</Text>

          <View className="mb-6">
            <Text className="text-lg font-bold text-text">{displayName}</Text>
            <Text className="text-sm text-text-soft mt-1">{email}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onChangeRole}
            className="w-full py-3 rounded-md border border-border items-center"
          >
            <Text className="text-base font-semibold text-text">역할 변경</Text>
          </Pressable>
        </View>
      </AppSheet>
    </>
  );
}
