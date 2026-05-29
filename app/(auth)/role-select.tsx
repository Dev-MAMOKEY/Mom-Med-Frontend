import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { NoticeDialog } from '@/components';
import { RoleSelectCard } from '@/components/domain';
import { useRoleStore, useSessionStore } from '@/stores';

// 역할 선택 화면 — 부모/자녀 시점 카드 2개, 선택 시 roleStore 저장 후 해당 홈으로 이동
export default function RoleSelect() {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const isDemoMode = useSessionStore((s) => s.isDemoMode);
  // "내 약장" 카드 — parent 화면 미구현 + 갇히는 placeholder라 진입을 막고 안내 모달만 띄움.
  // ⚠ early return 가드보다 위에 둬야 함 — caregiver 선택 후 재렌더링에서 가드가 일찍
  //   return 하면 useState 호출이 빠져 hook count mismatch가 난다 (실제로 한 번 발생).
  const [isParentNoticeOpen, setParentNoticeOpen] = useState(false);

  // 이미 역할이 선택돼 있으면 곧장 해당 홈으로 보냄
  if (role === 'parent') return <Redirect href="/(parent)/home" />;
  if (role === 'caregiver') return <Redirect href="/(caregiver)/parents" />;

  const handleParent = () => setParentNoticeOpen(true);
  const closeParentNotice = () => setParentNoticeOpen(false);

  const handleCaregiver = () => {
    setRole('caregiver');
    router.replace('/(caregiver)/parents');
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="px-6 pt-8 pb-8">
        <View className="items-center mt-8">
          <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center shadow-md">
            <Text className="text-4xl">💊</Text>
          </View>
        </View>
        <Text className="text-center text-3xl font-extrabold text-text mt-4">Yakjugo</Text>
        <Text className="text-center text-sm text-text-soft mt-2">가족 약 관리, 안심하고</Text>
      </View>

      <View className="px-6 mt-12">
        <Text className="text-base font-bold text-text mb-5 text-center">
          어떤 약장으로 들어갈까요?
        </Text>

        <View className="gap-3">
          <RoleSelectCard
            variant="outlined"
            title="내 약장"
            description="내 약·질병 직접 관리"
            icon={<Text className="text-2xl">👵</Text>}
            onPress={handleParent}
          />
          <RoleSelectCard
            variant="solid"
            title="자녀로 들어가기"
            description="부모님 약장 관리하기"
            icon={<Text className="text-2xl">🧑</Text>}
            onPress={handleCaregiver}
          />
        </View>
      </View>

      {isDemoMode && (
        <View className="absolute bottom-20 left-0 right-0 items-center">
          <Text className="text-xs text-text-mute">데모 모드 · 로그인 없이 진행</Text>
        </View>
      )}

      {/* "내 약장" 클릭 시 안내 — 해당 화면이 준비되기 전까지 진입 차단. */}
      <NoticeDialog
        open={isParentNoticeOpen}
        onClose={closeParentNotice}
        icon={<Text className="text-3xl">🛠️</Text>}
        title="개발 중이에요"
        description={'내 약장 기능은 아직 준비 중이에요.\n곧 만나보실 수 있어요.'}
        primaryAction={{ label: '확인', onPress: closeParentNotice }}
      />
    </View>
  );
}
