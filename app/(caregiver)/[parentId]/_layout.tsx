import { Stack } from 'expo-router';

// [parentId] 부모 컨텍스트 — F2에서 약장/질병/응급 탭으로 확장
export default function ParentScopedLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
