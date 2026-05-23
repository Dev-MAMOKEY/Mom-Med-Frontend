import { Stack } from 'expo-router';

// (parent) 그룹 레이아웃 — 부모 시점 화면 Stack, 헤더 숨김 (각 화면이 자체 헤더 처리)
export default function ParentLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
