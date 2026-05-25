import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

// 약 추가 모달 placeholder — #39에서 실제 구현으로 교체
export default function AddMedication() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-base text-text text-center">
        Add Medication: {parentId}
      </Text>
      <Text className="text-sm text-text-mute text-center mt-2">
        (#39에서 구현)
      </Text>
    </View>
  );
}
