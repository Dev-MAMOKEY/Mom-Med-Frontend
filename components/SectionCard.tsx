import type { ReactNode } from 'react';
import { View } from 'react-native';

// dev010 — 흰색 라운드 + 옅은 그림자 wrapper.
// conditions.tsx의 기저질환·알레르기 섹션을 한 덩어리로 묶기 위해 추출.
// 인터페이스 작음(children 단일), 시각 효과(배경·라운드·shadow) 응집.

export interface SectionCardProps {
  children: ReactNode;
}

export function SectionCard({ children }: SectionCardProps) {
  return (
    <View
      testID="section-card"
      className="bg-surface rounded-xl p-3 gap-3"
    >
      {children}
    </View>
  );
}
