import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { AddAllergyReq, AllergenType, AllergySeverity } from '@/api/types';
import { Header, ScreenContainer } from '@/components';
import { SeverityPicker } from '@/components/domain';
import { Button, Input } from '@/components/primitives';
import { useAddAllergy } from '@/hooks';
import { computeAddButtonLabel } from '@/utils/severity';

// 알레르겐 타입별 자주 등록되는 항목 — 목업 v2 알레르기 추가 모달의 추천 칩 데이터
const COMMON_ALLERGENS: Record<AllergenType, string[]> = {
  drug: ['페니실린', '아스피린', '조영제', '이부프로펜', '설파제'],
  food: ['땅콩', '갑각류', '우유', '밀', '달걀'],
  environment: ['꽃가루', '집먼지진드기', '고양이털', '라텍스'],
};

const TYPE_LABELS: Record<AllergenType, string> = {
  drug: '💊 약물',
  food: '🍞 음식',
  environment: '🌳 환경',
};

const TYPE_NOUN: Record<AllergenType, string> = {
  drug: '약물',
  food: '음식',
  environment: '환경',
};

const TYPE_ORDER: ReadonlyArray<AllergenType> = ['drug', 'food', 'environment'];

const TOAST_MS = 1500;

// 알레르기 추가 모달 (F3 화면 3) — 타입 칩 + 항목명(직접/추천) + severity 3단계 + 메모 + 추가
export default function AllergyAdd() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const [type, setType] = useState<AllergenType>('drug');
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('moderate');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { mutate: addAllergy, isPending } = useAddAllergy(parentId ?? '');

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  const onTypeChange = (next: AllergenType) => {
    setType(next);
    setName('');
  };

  // 추가 — 이름 trim 후 비어 있으면 무시. 성공 시 토스트 노출 후 conditions로 복귀
  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const req: AddAllergyReq = {
      allergen_type: type,
      allergen_name: trimmed,
      severity,
      notes: notes.trim() || undefined,
    };
    addAllergy(req, {
      onSuccess: () => {
        setToast(`${trimmed} 알레르기 추가 완료`);
        setTimeout(() => {
          if (router.canGoBack()) router.back();
        }, TOAST_MS);
      },
      onError: () => setToast('알레르기 추가에 실패했어요'),
    });
  };

  const header = <Header title="알레르기 추가" showBack onBack={onClose} />;
  const canSubmit = name.trim().length > 0 && !isPending;

  return (
    <View className="flex-1 relative">
      <ScreenContainer header={header}>
        <View className="px-5 pt-2 pb-6 gap-4">
          {/* 타입 칩 */}
          <View>
            <Text className="text-xs font-bold text-text-soft mb-2">
              알레르기 종류
            </Text>
            <View className="flex-row gap-2">
              {TYPE_ORDER.map((t) => {
                const isSelected = type === t;
                const containerClass = isSelected
                  ? 'bg-primary'
                  : 'bg-surface border border-border';
                const labelClass = isSelected
                  ? 'text-surface font-bold'
                  : 'text-text-soft font-semibold';
                return (
                  <Pressable
                    key={t}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => onTypeChange(t)}
                    className={`px-4 py-2 rounded-full ${containerClass}`}
                  >
                    <Text className={`text-xs ${labelClass}`}>
                      {TYPE_LABELS[t]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 항목명 입력 */}
          <Input
            label="항목명"
            value={name}
            onChangeText={setName}
            placeholder="알레르기 항목 이름"
          />

          {/* 자주 등록하는 항목 추천 */}
          <View>
            <Text className="text-xs text-text-mute mb-2">
              자주 등록하는 {TYPE_NOUN[type]}
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {COMMON_ALLERGENS[type].map((item) => {
                const isSelected = name === item;
                const containerClass = isSelected
                  ? 'bg-primary-soft'
                  : 'bg-surface-alt';
                const labelClass = isSelected
                  ? 'text-primary-bold'
                  : 'text-text-soft';
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setName(item)}
                    className={`px-3 py-1.5 rounded-md ${containerClass}`}
                  >
                    <Text className={`text-xs font-semibold ${labelClass}`}>
                      {item}
                      {isSelected ? ' ✓' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* severity 선택 */}
          <View>
            <Text className="text-xs font-bold text-text-soft mb-2">
              증상 강도
            </Text>
            <SeverityPicker value={severity} onChange={setSeverity} />
          </View>

          {/* 메모 (선택) — Input multiline로 자유 입력. 백엔드 patient_allergies.notes 필드 */}
          <Input
            label="메모 (선택)"
            value={notes}
            onChangeText={setNotes}
            placeholder="예: 검사 전 의료진에게 미리 알려주세요"
            multiline
            numberOfLines={2}
          />

          {/* 추가 — 이름 비어 있으면 disabled, severity가 severe면 danger 색 강조 */}
          <Button
            label={computeAddButtonLabel(name, severity)}
            variant={severity === 'severe' ? 'danger' : 'primary'}
            onPress={handleAdd}
            loading={isPending}
            disabled={!canSubmit}
          />
        </View>
      </ScreenContainer>

      {/* 인라인 토스트 — condition-add와 동일 패턴 */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-text rounded-md px-4 py-3">
          <Text className="text-surface font-bold text-center">{toast}</Text>
        </View>
      )}
    </View>
  );
}
