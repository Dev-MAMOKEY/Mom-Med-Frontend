import { Text, View } from 'react-native';

import type { SeverityHml } from '@/api/types/common';

export type SafetyEvidenceSource = 'DUR' | 'NB';

export interface SafetyDetailCardProps {
  source: SafetyEvidenceSource;
  severity: SeverityHml;
  message: string;
  citation?: string;
  citationSource?: string;
}

// severity별 좌측 4px 보더 색상
const severityBorder: Record<SeverityHml, string> = {
  high: 'border-danger',
  medium: 'border-warning',
  low: 'border-success',
};

// 출처(DUR/NB)별 뱃지 배경·텍스트
const sourceBadge: Record<SafetyEvidenceSource, { bg: string; label: string }> = {
  DUR: { bg: 'bg-danger', label: 'DUR' },
  NB: { bg: 'bg-warning', label: 'NB' },
};

// 안전판정 사유 1건 카드 — 좌측 severity 컬러 보더 + DUR/NB 뱃지 + 메시지 + 식약처 원문 인용
export function SafetyDetailCard({
  source,
  severity,
  message,
  citation,
  citationSource,
}: SafetyDetailCardProps) {
  const borderClass = severityBorder[severity];
  const badge = sourceBadge[source];

  return (
    <View
      className={`bg-surface border-l-4 ${borderClass} rounded-md p-3`}
    >
      <View className="flex-row items-start gap-2">
        <View className={`${badge.bg} px-1.5 py-0.5 rounded-sm`}>
          <Text className="text-[10px] font-bold text-surface">{badge.label}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-text mb-1">{message}</Text>
          {citation && (
            <Text className="text-[11px] text-text-soft leading-relaxed italic">
              &ldquo;{citation}&rdquo;
            </Text>
          )}
          {citationSource && (
            <Text className="text-[10px] text-text-mute mt-1">— {citationSource}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
