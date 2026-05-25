import { BarCodeScanner } from 'expo-barcode-scanner';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarcodeScanner, PillImage } from '@/components/domain';
import type { BarcodeScanResult } from '@/components/domain';
import { Button, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useDrugDetail } from '@/hooks';

const closeIconColor = tokens.color.neutral.surface.value;

// 약 추가 모달 — 카메라 권한 → 바코드/QR 스캔 → 미리보기 → 약 추가 흐름의 진입점
export default function AddMedication() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const [permission, requestPermission] = BarCodeScanner.usePermissions();
  const [selectedItemSeq, setSelectedItemSeq] = useState<string | null>(null);
  const { data: drug, isLoading: isDrugLoading } = useDrugDetail(
    selectedItemSeq ?? '',
  );

  // 닫기 → 약장으로 복귀
  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  // 스캔 — mock 모드에선 바코드 값을 곧바로 itemSeq로 사용. 실 환경에선 백엔드 01 mapping API 호출 필요
  const onScan = ({ data }: BarcodeScanResult) => setSelectedItemSeq(data);

  // 다시 스캔 — 미리보기 해제 후 스캐너로 복귀
  const onRescan = () => setSelectedItemSeq(null);

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

  // 미리보기 모드 — 스캔/검색으로 itemSeq가 선택된 상태에서 약 정보 + 추가/다시 스캔 액션 표시
  if (selectedItemSeq) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-text">
        {header}
        <View className="flex-1 items-center justify-center px-5 gap-4">
          {isDrugLoading || !drug ? (
            <Loading text="약 정보를 불러오는 중..." />
          ) : (
            <View className="w-full bg-surface rounded-xl p-6 items-center gap-3">
              <PillImage
                imageUrl={drug.pill_visual?.item_image}
                drugName={drug.item_name}
                size="lg"
              />
              <Text className="text-xl font-extrabold text-text text-center">
                {drug.item_name}
              </Text>
              {drug.atc_code && (
                <Text className="text-xs font-mono text-text-mute">
                  ATC {drug.atc_code}
                </Text>
              )}
              <View className="w-full gap-2 mt-2">
                {/* "이 약 추가" 버튼은 useAddMedication 분기와 함께 후속 커밋에서 추가 */}
                <Button label="다시 스캔" variant="ghost" onPress={onRescan} />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // 스캔 모드 — 카메라 뷰포트 + 가이드 박스 (옵션 버튼·BottomSheet은 후속 커밋)
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-text">
      {header}
      <View className="flex-1 px-5 pt-2">
        <View className="w-full" style={{ height: 380 }}>
          <BarcodeScanner onScan={onScan} />
        </View>
        <Text className="text-xs text-surface/60 text-center mt-3">
          parent: {parentId}
        </Text>
      </View>
    </SafeAreaView>
  );
}
