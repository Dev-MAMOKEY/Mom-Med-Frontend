import { Stack } from 'expo-router';

// (auth) 그룹 레이아웃 — 로그인 / 역할 선택 화면 묶음, 헤더 숨김
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
