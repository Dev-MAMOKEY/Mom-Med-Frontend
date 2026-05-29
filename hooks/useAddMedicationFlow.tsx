import { BarCodeScanner } from 'expo-barcode-scanner';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ApiError, SafetyBlockError } from '@/api/client';
import type { BlockErrorBody, Medication } from '@/api/types';
import { AppSheet, NoticeDialog } from '@/components';
import { Input, ListItem, Loading } from '@/components/primitives';
import { useAddMedication } from './useAddMedication';
import { useDebouncedValue } from './useDebouncedValue';
import { useDrugSearch } from './useDrugSearch';

const SEARCH_SHEET_SNAP = ['50%'];
const SEARCH_DEBOUNCE_MS = 250;

function errorToUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return '데모에 없는 약이에요. 다른 약을 선택해주세요.';
    if (err.status === 400) return '잘못된 요청이에요. 다시 시도해주세요.';
    return `약 추가에 실패했어요. (${err.status})`;
  }
  return '약 추가에 실패했어요. 잠시 후 다시 시도해주세요.';
}

// 검색 시트 내용 — 자체적으로 query state + mutation 관리.
// 부모(useAddMedicationFlow가 마운트된 화면)는 query/error 변경에 리렌더되지 않음.
// RN Web에서 부모가 자주 리렌더되면 TextInput value prop 재설정으로 한글 IME가 깨졌음.
function SearchSheetContent({
  parentId,
  onClose,
}: {
  parentId: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const { data: searchResults, isFetching: isSearching } = useDrugSearch(debouncedQuery);
  const { mutate: addMedication, isPending: isAdding } = useAddMedication(parentId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 검색어 변경 시 이전 에러 메시지 클리어
  const onChangeQuery = (v: string) => {
    if (errorMessage) setErrorMessage(null);
    setQuery(v);
  };

  const onSelectMed = (med: Medication) => {
    if (isAdding) return;
    setErrorMessage(null);
    addMedication(
      { item_seq: med.item_seq, source: 'manual' },
      {
        onSuccess: (res) => {
          onClose();
          if (res.safety_check.decision === 'ALLOW') return;
          router.push({
            pathname: '/(modals)/safety-result',
            params: {
              decision: 'WARN',
              parentId,
              itemSeq: med.item_seq,
              medicationId: res.medication_id,
              evidences: JSON.stringify(res.safety_check.evidences),
            },
          });
        },
        onError: (err) => {
          if (err instanceof SafetyBlockError) {
            onClose();
            const body = err.payload as BlockErrorBody;
            router.push({
              pathname: '/(modals)/safety-result',
              params: {
                decision: 'BLOCK',
                parentId,
                itemSeq: med.item_seq,
                evidences: JSON.stringify(body.verdict.evidences),
              },
            });
            return;
          }
          // 일반 에러(404/400/500 등) — 시트는 유지하고 사용자에게 사유 노출
          setErrorMessage(errorToUserMessage(err));
        },
      },
    );
  };

  const results = searchResults?.results ?? [];
  const showNoResults =
    debouncedQuery.length >= 2 && !isSearching && results.length === 0;

  return (
    <View className="px-5 pt-2 pb-6 gap-3">
      <Text className="text-base font-bold text-text">약 이름 검색</Text>
      <Input
        variant="search"
        placeholder="약 이름이나 성분 (2글자 이상)"
        value={query}
        onChangeText={onChangeQuery}
      />

      {errorMessage && (
        <View className="bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
          <Text className="text-sm text-danger">{errorMessage}</Text>
        </View>
      )}

      {isAdding && (
        <View className="py-4">
          <Loading size="sm" text="추가하는 중..." />
        </View>
      )}

      {!isAdding && debouncedQuery.length >= 2 && isSearching && (
        <View className="py-4">
          <Loading size="sm" />
        </View>
      )}

      {!isAdding && showNoResults && (
        <Text className="text-sm text-text-mute text-center py-4">
          &quot;{debouncedQuery}&quot; 검색 결과가 없어요
        </Text>
      )}

      {!isAdding && (
        <View className="gap-1">
          {results.map((med) => (
            <ListItem
              key={med.item_seq}
              title={med.item_name}
              subtitle={med.main_ingr_en ?? ''}
              onPress={() => onSelectMed(med)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// + 약 추가 진입점(meds, notifications)이 공유하는 흐름.
//
// 권한 허용 → add-medication 풀스크린 모달 (바코드 스캔 흐름)
// 권한 거부 → NoticeDialog 노출
//   - "권한 요청" → requestPermission → 허용되면 풀스크린 모달
//   - "직접 입력으로 진행" → 약장 화면 위에 검색 AppSheet 노출 (풀스크린 진입 안 함)
//
// 검색 시트는 자체적으로 mutation·에러 처리 (SearchSheetContent).
export function useAddMedicationFlow(parentId: string) {
  const [permission, requestPermission] = BarCodeScanner.usePermissions();
  const [isNoticeOpen, setNoticeOpen] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const closeNotice = () => setNoticeOpen(false);
  const closeSheet = () => setSheetOpen(false);

  const onAddMedication = () => {
    if (permission?.granted) {
      router.push({
        pathname: '/(modals)/add-medication',
        params: { parentId },
      });
    } else {
      setNoticeOpen(true);
    }
  };

  const onRequestPermission = async () => {
    const result = await requestPermission();
    setNoticeOpen(false);
    if (result.granted) {
      router.push({
        pathname: '/(modals)/add-medication',
        params: { parentId },
      });
    }
  };

  const onDirectInput = () => {
    setNoticeOpen(false);
    setSheetOpen(true);
  };

  const Components = (
    <>
      <NoticeDialog
        open={isNoticeOpen}
        onClose={closeNotice}
        icon={<Text className="text-3xl">📷</Text>}
        title="카메라 권한이 필요해요"
        description="약 포장의 바코드·QR을 스캔하려면 카메라 접근이 필요합니다."
        primaryAction={{ label: '권한 요청', onPress: onRequestPermission }}
        secondaryAction={{ label: '직접 입력으로 진행', onPress: onDirectInput }}
      />
      <AppSheet open={isSheetOpen} onClose={closeSheet} snapPoints={SEARCH_SHEET_SNAP}>
        <SearchSheetContent parentId={parentId} onClose={closeSheet} />
      </AppSheet>
    </>
  );

  return {
    onAddMedication,
    Components,
  };
}
