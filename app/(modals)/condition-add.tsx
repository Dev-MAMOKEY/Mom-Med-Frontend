import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { DiseaseSearchResult } from '@/api/types';
import { Header, ScreenContainer } from '@/components';
import { ConditionTag, KcdSearchInput } from '@/components/domain';
import { Button } from '@/components/primitives';
import { useAddCondition } from '@/hooks';

const TOAST_MS = 1500;

// 질병 추가 모달 (F3 화면 2) — 검색 → 선택 → 미리보기 → 추가 2단계 흐름
export default function ConditionAdd() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const [selected, setSelected] = useState<DiseaseSearchResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { mutate: addCondition, isPending } = useAddCondition(parentId ?? '');

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  // 추가 — 성공 시 토스트 노출 후 약장으로 복귀 (add-medication.tsx ALLOW 분기와 동일 패턴)
  const handleAdd = () => {
    if (!selected) return;
    addCondition(
      { disease_code: selected.sickCd },
      {
        onSuccess: () => {
          setToast(`${selected.sickNm} 추가 완료`);
          setTimeout(() => {
            if (router.canGoBack()) router.back();
          }, TOAST_MS);
        },
        onError: () => setToast('질병 추가에 실패했어요'),
      },
    );
  };

  const header = <Header title="질병 추가하기" showBack onBack={onClose} />;

  return (
    <View className="flex-1 relative">
      <ScreenContainer header={header}>
        <View className="px-5 pt-2 pb-6 gap-3">
          {selected ? (
            // 미리보기 모드 — 선택된 질병 카드 + 영문명 + 안내 + 액션
            <View className="gap-3">
              <ConditionTag
                code={selected.sickCd}
                name={selected.sickNm}
                variant="card"
              />
              <Text className="text-xs text-text-mute">
                {selected.sickEngNm}
              </Text>

              {/* 약 주의 정보 실 데이터는 #49에서 fetch — 본 PR은 안내 텍스트만 */}
              <View className="bg-info-soft rounded-md p-3">
                <Text className="text-xs text-text-soft leading-relaxed">
                  <Text className="font-bold text-info">💡 </Text>
                  추가 후 약장 탭에서 이 질병과 관련된 약 주의 사항을 확인할 수
                  있어요.
                </Text>
              </View>

              <Button
                label="추가"
                variant="primary"
                onPress={handleAdd}
                loading={isPending}
              />
              <Button
                label="다시 검색"
                variant="ghost"
                onPress={() => setSelected(null)}
                disabled={isPending}
              />
            </View>
          ) : (
            <KcdSearchInput
              onSelect={(r) => setSelected(r)}
              placeholder="질병 코드 또는 한글명 (예: 고혈압, I10)"
            />
          )}
        </View>
      </ScreenContainer>

      {/* 인라인 토스트 — add-medication.tsx와 동일, 단 라이트 배경에 다크 카드 */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-text rounded-md px-4 py-3">
          <Text className="text-surface font-bold text-center">{toast}</Text>
        </View>
      )}
    </View>
  );
}
