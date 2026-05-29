import { router } from 'expo-router';
import { Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { Parent } from '@/api/types/parent';
import { AppMenuButton, Header, ScreenContainer } from '@/components';
import { ParentListItem } from '@/components/domain/ParentListItem';
import { EmptyState, Loading } from '@/components/primitives';
import { useParents } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// hover/press 시 opacity로 시각 피드백.
// nativewind/css-interop가 함수형 style을 wrap하므로 외부 직접 검증은 어려움 →
// 별도 export해 단위 테스트는 함수 자체 동작만 가드.
export function addParentButtonStyle({
  hovered,
  pressed,
}: {
  hovered: boolean;
  pressed: boolean;
}) {
  if (pressed) return { opacity: 0.8 };
  if (hovered) return { opacity: 0.9 };
  return null;
}

// 자녀 시점 — 관리하는 부모 목록 화면 (목업 화면 2)
export default function CaregiverParents() {
  const { data, isLoading } = useParents();
  const parents = data?.parents ?? [];

  // 부모 카드 탭 → 현재 부모 컨텍스트 설정 + 해당 부모 약장으로 이동
  const onParentPress = (parent: Parent) => {
    useCurrentParentStore.getState().setParent(parent.parent_id, parent.display_name);
    router.push({ pathname: '/(caregiver)/[parentId]/notifications', params: { parentId: parent.parent_id } });
  };

  // 하단 등록 버튼 → 부모 등록 플로우 (phone 화면)
  const goAddParent = () => router.push('/(caregiver)/add-parent/phone');

  return (
    <ScreenContainer
      header={<Header title="부모님 약 관리하기" right={<AppMenuButton />} />}
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
          cta={{ label: '+ 등록하기', onPress: goAddParent }}
        />
      ) : (
        <View className="px-5 pt-1 pb-6">
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
              testID="add-parent-button"
              onPress={goAddParent}
              className="bg-primary-bold rounded-xl p-4 items-center justify-center"
              // hover 시 살짝 옅어지고, press 시 더 옅어져 "눌렸음"을 즉시 인지.
              // RN Web의 Pressable은 hovered 상태도 제공 → web/mobile 둘 다 자연스럽게 동작.
              style={addParentButtonStyle}
            >
              <Text className="text-base font-bold text-surface">
                + 등록하기
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
