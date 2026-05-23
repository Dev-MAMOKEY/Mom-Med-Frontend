import { Stack } from 'expo-router';

// 부모 등록 플로우 Stack — phone → verify 2단계
export default function AddParentLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
