import { Text, View } from 'react-native';

// 질병 탭 placeholder — F3에서 본문 구현
export default function ParentConditionsPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-base text-text-soft text-center">질병 (F3에서 구현)</Text>
    </View>
  );
}
