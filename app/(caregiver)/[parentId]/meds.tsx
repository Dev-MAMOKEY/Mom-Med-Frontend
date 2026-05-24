import { Text, View } from 'react-native';

// 약장 탭 placeholder — #35에서 약장 화면 본문으로 교체
export default function ParentMedsPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-base text-text-soft text-center">약장 (#35에서 구현)</Text>
    </View>
  );
}
