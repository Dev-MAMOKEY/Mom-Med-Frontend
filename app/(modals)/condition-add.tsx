import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { DiseaseSearchResult } from '@/api/types';
import { Header, ScreenContainer } from '@/components';
import { KcdSearchInput } from '@/components/domain';

// 질병 추가 모달 (F3 화면 2) — 본 커밋은 검색 모드만, 다음 커밋에서 미리보기/추가 추가
export default function ConditionAdd() {
  const { parentId: _parentId } = useLocalSearchParams<{ parentId: string }>();
  const [_selected, setSelected] = useState<DiseaseSearchResult | null>(null);

  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  const header = (
    <Header title="질병 추가하기" showBack onBack={onClose} />
  );

  return (
    <ScreenContainer header={header}>
      <View className="px-5 pt-2 pb-6 gap-3">
        <KcdSearchInput
          onSelect={(r) => setSelected(r)}
          placeholder="질병 코드 또는 한글명 (예: 고혈압, I10)"
        />
      </View>
    </ScreenContainer>
  );
}
