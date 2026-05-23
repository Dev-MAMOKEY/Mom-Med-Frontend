import { Text, View } from 'react-native';

// 부모 홈 placeholder — F2 이슈에서 실제 약장 화면으로 교체
export default function ParentHome() {
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <Text className="text-base text-text">Parent Home (F2에서 구현)</Text>
    </View>
  );
}
