import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

// 약 상세 모달 placeholder — #37에서 실제 구현으로 교체
export default function MedicationDetail() {
  const { itemSeq } = useLocalSearchParams<{ itemSeq: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-base text-text text-center">
        Medication Detail: {itemSeq}
      </Text>
      <Text className="text-sm text-text-mute text-center mt-2">
        (#37에서 구현)
      </Text>
    </View>
  );
}
