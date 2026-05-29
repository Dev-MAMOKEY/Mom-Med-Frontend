// dev010 — 알레르기 강도(severity) 한국어 라벨 매핑 + 알레르기 추가 버튼 라벨 빌더.
// SeverityPicker와 allergy-add가 공유하는 SSOT.

import type { AllergySeverity } from '@/api/types/common';

export const SEVERITY_LABELS: Record<AllergySeverity, string> = {
  mild: '가벼움',
  moderate: '중간',
  severe: '심각',
};

// 알레르기 추가 화면의 제출 버튼 라벨.
// name이 비어 있으면 단순 "추가", 있으면 "X (한글강도) 추가".
export function computeAddButtonLabel(
  name: string,
  severity: AllergySeverity,
): string {
  const trimmed = name.trim();
  if (!trimmed) return '추가';
  return `${trimmed} (${SEVERITY_LABELS[severity]}) 추가`;
}
