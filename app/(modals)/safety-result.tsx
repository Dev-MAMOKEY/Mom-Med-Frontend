import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

// 안전판정 결과 모달 placeholder — #41에서 실제 구현으로 교체
// add-medication에서 WARN/BLOCK 결정 시 params(decision·parentId·itemSeq·evidences)와 함께 진입
export default function SafetyResult() {
  const { decision, itemSeq } = useLocalSearchParams<{
    decision: string;
    itemSeq: string;
  }>();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-base text-text text-center">
        Safety Result · {decision} · {itemSeq}
      </Text>
      <Text className="text-sm text-text-mute text-center mt-2">
        (#41에서 구현)
      </Text>
    </View>
  );
}
