import { BarCodeScanner } from 'expo-barcode-scanner';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';

const closeIconColor = tokens.color.neutral.surface.value;

// 약 추가 모달 — 카메라 권한 → 바코드/QR 스캔 → 미리보기 → 약 추가 흐름의 진입점
export default function AddMedication() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const [permission, requestPermission] = BarCodeScanner.usePermissions();

  // 닫기 → 약장으로 복귀
  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  // 상단 헤더 — 풀스크린 다크 모달 기준 흰색 X · 제목 · 우측 placeholder
  const header = (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        onPress={onClose}
        hitSlop={8}
      >
        <X size={24} color={closeIconColor} />
      </Pressable>
      <Text className="text-base font-bold text-surface">약 추가하기</Text>
      <View className="w-6" />
    </View>
  );

  // 권한 응답 대기 — usePermissions가 null을 반환하는 첫 렌더
  if (!permission) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-text">
        {header}
        <View className="flex-1 items-center justify-center">
          <Loading text="카메라 권한을 확인하는 중..." />
        </View>
      </SafeAreaView>
    );
  }

  // 권한 미허용 — 권한 요청 또는 직접 입력으로 진행 안내
  if (!permission.granted) {
    const isPermanentlyDenied = !permission.canAskAgain;
    const onPermissionAction = () => {
      if (isPermanentlyDenied) Linking.openSettings();
      else requestPermission();
    };

    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-text">
        {header}
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Text className="text-lg font-bold text-surface text-center">
            카메라 권한이 필요해요
          </Text>
          <Text className="text-sm text-surface/70 text-center">
            약 포장의 바코드·QR을 스캔하려면 카메라 접근이 필요합니다.
          </Text>
          <View className="w-full gap-2 mt-4">
            <Button
              label={isPermanentlyDenied ? '설정 열기' : '권한 요청'}
              variant="primary"
              onPress={onPermissionAction}
            />
            <Button
              label="직접 입력으로 진행"
              variant="ghost"
              onPress={() => undefined}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 권한 허용 — 본문은 후속 커밋(스캐너·옵션·미리보기·BottomSheet)에서 채움
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-text">
      {header}
      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-surface/70">스캐너 준비 중...</Text>
        <Text className="text-xs text-surface/50 mt-1">parentId: {parentId}</Text>
      </View>
    </SafeAreaView>
  );
}
