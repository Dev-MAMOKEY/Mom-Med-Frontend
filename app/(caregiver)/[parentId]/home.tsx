import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { useCurrentParentStore } from '@/stores';

// 부모 약장 홈 placeholder — F2에서 약장 화면으로 교체
export default function ParentScopedHome() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const displayName = useCurrentParentStore((s) => s.displayName);

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(caregiver)/parents');
  };

  return (
    <ScreenContainer
      header={<Header title={displayName ?? '부모님'} showBack onBack={onBack} />}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base text-text text-center">
          부모 컨텍스트: {displayName ?? parentId}
        </Text>
        <Text className="text-sm text-text-mute text-center mt-2">
          (F2에서 약장 화면으로 교체)
        </Text>
      </View>
    </ScreenContainer>
  );
}
