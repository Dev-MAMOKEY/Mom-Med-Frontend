import { Text, View } from 'react-native';

import type { SeverityHml } from '@/api/types/common';

export type SafetyEvidenceSource = 'DUR' | 'NB';

export interface SafetyDetailCardProps {
  source: SafetyEvidenceSource;
  severity: SeverityHml;
  message: string;
  citation?: string;
  citationSource?: string;
  // 카드 내부 뱃지 좌측에 표시할 레이블 (예: "차단 사유" / "주의 사유").
  // 외부 헤더 줄 없이 카드 안에서 컨텍스트를 표현하기 위함.
  contextLabel?: string;
}

// 출처(DUR/NB)별 뱃지 — 약어 대신 사용자가 의미를 알 수 있는 한글로 노출.
// DUR = 식약처 의약품 안전사용 서비스(Drug Utilization Review). 데모 범위는 병용금기 데이터.
// NB  = 식약처 안전성 안내·부작용 정보.
const sourceBadge: Record<SafetyEvidenceSource, { bg: string; label: string }> = {
  DUR: { bg: 'bg-danger', label: '병용금기' },
  NB: { bg: 'bg-warning', label: '주의사항' },
};

// severity는 호출처 시그니처 호환을 위해 prop으로 유지하지만 현재 시각 표현(좌측 보더)이 제거되어 사용 안 함.
// 추후 시각 강조가 다시 필요해지면 여기서 분기를 복원.

// 안전판정 사유 1건 카드 — 흰 배경 + 컨텍스트 라벨 + 출처 뱃지 + 메시지 + 식약처 원문 인용
export function SafetyDetailCard({
  source,
  message,
  citation,
  citationSource,
  contextLabel,
}: SafetyDetailCardProps) {
  const badge = sourceBadge[source];

  // BE가 동일 문장을 message와 citation 양쪽으로 내려주는 경우 자동 중복 제거.
  // 공백·따옴표 차이만 있는 케이스도 흡수.
  const normalize = (s: string) => s.trim().replace(/^["“'']|["”'']$/g, '');
  const showCitation = citation && normalize(citation) !== normalize(message);

  return (
    <View className="bg-surface rounded-lg p-4">
      <View className="flex-row items-center gap-2 mb-2">
        {contextLabel && (
          <Text className="text-sm font-bold text-text">{contextLabel}</Text>
        )}
        <View className={`${badge.bg} px-2 py-0.5 rounded-md`}>
          <Text className="text-xs font-bold text-surface">{badge.label}</Text>
        </View>
      </View>

      <Text className="text-sm font-bold text-text leading-snug">{message}</Text>

      {showCitation && (
        <View className="mt-3 pl-3 border-l-2 border-border">
          <Text className="text-xs text-text-soft leading-relaxed italic">
            &ldquo;{citation}&rdquo;
          </Text>
        </View>
      )}

      {citationSource && (
        <Text className="text-xs text-text-mute mt-2">— {citationSource}</Text>
      )}
    </View>
  );
}
