import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { Decision } from '@/api/types/common';

export interface SafetyBannerProps {
  decision: Decision;
  title?: string;
  subtitle?: string;
  // 배너 안에 같은 색조로 합쳐서 보여줄 추가 영역 — safety-result의 약 비교 카드 통합 등.
  // 제공 시 본문 아래에 풀폭으로 렌더되어 "하나의 덩어리" 시각 인상을 만든다.
  children?: ReactNode;
}

// decision별 배경·기본 제목·이모지
const decisionStyle: Record<Decision, { bg: string; emoji: string; defaultTitle: string }> = {
  ALLOW: { bg: 'bg-success', emoji: '✓', defaultTitle: '안전' },
  WARN: { bg: 'bg-warning', emoji: '⚠️', defaultTitle: '주의 필요' },
  BLOCK: { bg: 'bg-danger', emoji: '🚫', defaultTitle: '위험한 조합' },
};

const decisionSubtitle: Record<Decision, string> = {
  ALLOW: '같이 드셔도 괜찮아요',
  WARN: '의사 확인이 필요해요',
  BLOCK: '이 약은 같이 드시면 안 돼요',
};

// 안전판정 결과 풀카드 배너 — 큰 이모지 + 제목 + 보조 메시지 (BLOCK/WARN/ALLOW 색상 분기)
export function SafetyBanner({ decision, title, subtitle, children }: SafetyBannerProps) {
  const style = decisionStyle[decision];
  const titleText = title ?? style.defaultTitle;
  const subtitleText = subtitle ?? decisionSubtitle[decision];

  return (
    <View className={`${style.bg} rounded-2xl p-6 items-center`}>
      <Text className="text-5xl mb-2">{style.emoji}</Text>
      <Text className="text-3xl font-extrabold text-surface text-center mb-1">
        {titleText}
      </Text>
      {subtitleText && (
        <Text className="text-sm text-surface/90 text-center">{subtitleText}</Text>
      )}
      {children && <View className="w-full mt-5">{children}</View>}
    </View>
  );
}
