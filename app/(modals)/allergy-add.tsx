import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { AllergenType } from '@/api/types';
import { Header, ScreenContainer } from '@/components';
import { Input } from '@/components/primitives';

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

const TYPE_ORDER: ReadonlyArray<AllergenType> = ['drug', 'food', 'environment'];

// 알레르기 추가 모달 (F3 화면 3) — 본 커밋은 타입 칩·추천·이름 입력만, 다음 커밋에서 severity·메모·제출
export default function AllergyAdd() {
  const { parentId: _parentId } = useLocalSearchParams<{ parentId: string }>();
  const [type, setType] = useState<AllergenType>('drug');
  const [name, setName] = useState('');

  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  // 타입 전환 시 입력 항목 리셋 — 추천 칩 풀이 바뀌므로 이전 입력은 무효
  const onTypeChange = (next: AllergenType) => {
    setType(next);
    setName('');
  };

  const header = <Header title="알레르기 추가" showBack onBack={onClose} />;

  return (
    <ScreenContainer header={header}>
      <View className="px-5 pt-2 pb-6 gap-4">
        {/* 타입 칩 — 목업 v2 화면 15번 pill 형 토글 */}
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

        {/* 자주 등록하는 항목 추천 — 타입에 따라 풀이 바뀜 */}
        <View>
          <Text className="text-xs text-text-mute mb-2">
            자주 등록하는 {type === 'drug' ? '약물' : type === 'food' ? '음식' : '환경'}
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
      </View>
    </ScreenContainer>
  );
}
