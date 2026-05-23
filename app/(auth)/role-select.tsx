import { Redirect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { RoleSelectCard } from '@/components/domain';
import { useRoleStore, useSessionStore } from '@/stores';

// 역할 선택 화면 — 부모/자녀 시점 카드 2개, 선택 시 roleStore 저장 후 해당 홈으로 이동
export default function RoleSelect() {
  const router = useRouter();
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const isDemoMode = useSessionStore((s) => s.isDemoMode);

  // 이미 역할이 선택돼 있으면 곧장 해당 홈으로 보냄
  if (role === 'parent') return <Redirect href="/(parent)/home" />;
  if (role === 'caregiver') return <Redirect href="/(caregiver)/parents" />;

  const handleParent = () => {
    setRole('parent');
    router.replace('/(parent)/home');
  };

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
        <Text className="text-center text-3xl font-extrabold text-text mt-4">엄마약</Text>
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
    </View>
  );
}
