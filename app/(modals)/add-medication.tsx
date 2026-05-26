import { BarCodeScanner } from 'expo-barcode-scanner';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SafetyBlockError } from '@/api/client';
import type { BlockErrorBody, Medication, MedicationSource } from '@/api/types';
import { BarcodeScanner, PillImage } from '@/components/domain';
import type { BarcodeScanResult } from '@/components/domain';
import { BottomSheet, Button, Input, ListItem, Loading } from '@/components/primitives';
import type { BottomSheetRef } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useAddMedication, useDrugDetail, useDrugSearch } from '@/hooks';

const closeIconColor = tokens.color.neutral.surface.value;
const TOAST_MS = 1500;

// 약 추가 모달 — 카메라 권한 → 바코드/QR 스캔 → 미리보기 → 약 추가 흐름의 진입점
export default function AddMedication() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const [permission, requestPermission] = BarCodeScanner.usePermissions();
  const [selectedItemSeq, setSelectedItemSeq] = useState<string | null>(null);
  // 추가 mutation의 source는 진입 경로(스캔/직접 입력)에 따라 분기 — 백엔드 04 patient_medications.source CHECK
  const [selectedSource, setSelectedSource] = useState<MedicationSource>('scan');
  const { data: drug, isLoading: isDrugLoading } = useDrugDetail(
    selectedItemSeq ?? '',
  );
  const { mutate: addMedication, isPending: isAdding } = useAddMedication(
    parentId ?? '',
  );

  // 검색 BottomSheet 상태 — useDrugSearch는 query.length >= 2일 때만 활성
  const sheetRef = useRef<BottomSheetRef>(null);
  const snapPoints = useMemo(() => ['75%'], []);
  const [query, setQuery] = useState('');
  const { data: searchResults, isFetching: isSearching } = useDrugSearch(query);

  // 인라인 토스트 — 1.5초 후 자동 해제 (medication-detail.tsx와 동일 패턴)
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  // 닫기 → 약장으로 복귀
  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  // 스캔 — mock 모드에선 바코드 값을 곧바로 itemSeq로 사용. 실 환경에선 백엔드 01 mapping API 호출 필요
  const onScan = ({ data }: BarcodeScanResult) => {
    setSelectedSource('scan');
    setSelectedItemSeq(data);
  };

  // 다시 스캔 — 미리보기 해제 후 스캐너로 복귀
  const onRescan = () => setSelectedItemSeq(null);

  // 손전등·앨범은 본 PR 범위 밖 — "준비 중" 토스트만
  const onTorch = () => setToast('손전등은 준비 중이에요');
  const onAlbum = () => setToast('앨범 선택은 준비 중이에요');

  // 직접 입력 — BottomSheet 오픈. 권한 거부 분기에서도 동일 핸들러 사용
  const onDirectInput = () => sheetRef.current?.present();

  // 검색 결과 탭 → 미리보기 모드로 전환 + 시트 닫기 + 검색어 초기화
  const onSearchResultPress = (med: Medication) => {
    setSelectedSource('manual');
    setSelectedItemSeq(med.item_seq);
    sheetRef.current?.dismiss();
    setQuery('');
  };

  // "이 약 추가" — useAddMedication.mutate + ALLOW/WARN/BLOCK 분기
  // - ALLOW: 토스트 + 약장 복귀
  // - WARN: 약 추가됨 + safety-result 모달로 router.replace (evidences는 JSON.stringify로 params 전달)
  // - BLOCK: SafetyBlockError throw 시 safety-result 모달 (약 미추가)
  const handleAdd = () => {
    if (!selectedItemSeq || !drug) return;
    addMedication(
      { item_seq: selectedItemSeq, source: selectedSource },
      {
        onSuccess: (res) => {
          if (res.safety_check.decision === 'ALLOW') {
            setToast(`${drug.item_name} 추가 완료`);
            setTimeout(() => {
              if (router.canGoBack()) router.back();
            }, TOAST_MS);
            return;
          }
          // WARN — 약은 이미 추가됨, 사용자에게 결과 안내
          router.replace({
            pathname: '/(modals)/safety-result',
            params: {
              decision: 'WARN',
              parentId: parentId ?? '',
              itemSeq: selectedItemSeq,
              medicationId: res.medication_id,
              evidences: JSON.stringify(res.safety_check.evidences),
            },
          });
        },
        onError: (err) => {
          if (err instanceof SafetyBlockError) {
            // payload 타입은 common.ts의 placeholder(verdict: unknown)라 safety.ts의 typed BlockErrorBody로 좁힌다
            const body = err.payload as BlockErrorBody;
            // BLOCK — 약 미추가, 사유와 함께 결과 모달
            router.replace({
              pathname: '/(modals)/safety-result',
              params: {
                decision: 'BLOCK',
                parentId: parentId ?? '',
                itemSeq: selectedItemSeq,
                evidences: JSON.stringify(body.verdict.evidences),
              },
            });
            return;
          }
          setToast('약 추가에 실패했어요');
        },
      },
    );
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

  // 상태별 본문 — 권한 응답 대기 → 권한 거부 → 미리보기 → 스캔
  let content: ReactNode;

  if (!permission) {
    content = (
      <View className="flex-1 items-center justify-center">
        <Loading text="카메라 권한을 확인하는 중..." />
      </View>
    );
  } else if (!permission.granted) {
    const isPermanentlyDenied = !permission.canAskAgain;
    const onPermissionAction = () => {
      if (isPermanentlyDenied) Linking.openSettings();
      else requestPermission();
    };

    content = (
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
            onPress={onDirectInput}
          />
        </View>
      </View>
    );
  } else if (selectedItemSeq) {
    content = (
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
              <Button
                label="이 약 추가"
                variant="primary"
                loading={isAdding}
                onPress={handleAdd}
              />
              <Button
                label="다시 스캔"
                variant="ghost"
                disabled={isAdding}
                onPress={onRescan}
              />
            </View>
          </View>
        )}
      </View>
    );
  } else {
    content = (
      <View className="flex-1 px-5 pt-2">
        <View className="w-full" style={{ height: 380 }}>
          <BarcodeScanner onScan={onScan} />
        </View>

        {/* 옵션 3분할 — 손전등·앨범은 placeholder, 직접 입력은 BottomSheet 오픈 */}
        <View className="mt-5 flex-row gap-2">
          <ScanOption emoji="🔦" label="손전등" onPress={onTorch} />
          <ScanOption emoji="🖼️" label="앨범" onPress={onAlbum} />
          <ScanOption emoji="⌨️" label="직접 입력" onPress={onDirectInput} />
        </View>
      </View>
    );
  }

  const results = searchResults?.results ?? [];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-text">
      {header}
      {content}

      {/* 인라인 토스트 — top-14 절대 배치, 다크 배경 위 흰 카드 */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-surface rounded-md px-4 py-3">
          <Text className="text-text font-bold text-center">{toast}</Text>
        </View>
      )}

      {/* 직접 입력 BottomSheet — 검색은 useDrugSearch가 query.length >= 2에서만 활성 */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <View className="px-5 pt-2 pb-6 gap-3">
          <Text className="text-base font-bold text-text">약 이름 검색</Text>
          <Input
            variant="search"
            placeholder="약 이름이나 성분 (2글자 이상)"
            value={query}
            onChangeText={setQuery}
          />

          {query.length >= 2 && isSearching && (
            <View className="py-4">
              <Loading size="sm" />
            </View>
          )}

          {query.length >= 2 && !isSearching && results.length === 0 && (
            <Text className="text-sm text-text-mute text-center py-4">
              &quot;{query}&quot; 검색 결과가 없어요
            </Text>
          )}

          <View className="gap-1">
            {results.map((med) => (
              <ListItem
                key={med.item_seq}
                title={med.item_name}
                subtitle={med.main_ingr_en ?? ''}
                onPress={() => onSearchResultPress(med)}
              />
            ))}
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

// 스캔 모드 하단 옵션 1칸 — 다크 배경 위 살짝 떠 보이는 카드 형태
function ScanOption({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-1 bg-surface/10 rounded-md py-3 items-center"
    >
      <Text className="text-2xl mb-1">{emoji}</Text>
      <Text className="text-[11px] font-semibold text-surface/80">{label}</Text>
    </Pressable>
  );
}
