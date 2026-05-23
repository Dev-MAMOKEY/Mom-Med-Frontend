import { Stack } from 'expo-router';

// (caregiver) 그룹 레이아웃 — 자녀 시점 화면 Stack, 헤더 숨김
export default function CaregiverLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
