import { Stack } from 'expo-router';

// (modals) 그룹 — 약 상세·약 추가 등 풀스크린 모달 컨테이너 (실제 본문은 #37·#39에서 구현)
export default function ModalsLayout() {
  return <Stack screenOptions={{ presentation: 'modal', headerShown: false }} />;
}
