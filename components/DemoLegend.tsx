// 공모전 시연용 가이드 패널 — PhoneFrame 왼쪽에 노출.
// 데모 약 카탈로그 + BLOCK 시연 흐름 + 식약처 고시 출처.
// Web frame 모드(PhoneFrame)에서만 의미가 있으므로 PhoneFrame 안에서만 마운트된다.

import { Text, View } from 'react-native';

interface DemoDrug {
  emoji: string;
  name: string;
  detail: string;
}

const DEMO_DRUGS: ReadonlyArray<DemoDrug> = [
  { emoji: '💊', name: '메트포르민 500mg', detail: '당뇨' },
  { emoji: '💉', name: '이오헥솔 300mg/mL', detail: '조영제 (주사)' },
  { emoji: '💊', name: '암로디핀 5mg', detail: '혈압' },
  { emoji: '💊', name: '아세트아미노펜 500mg', detail: '진통·해열' },
];

export function DemoLegend() {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>데모 시연 가이드</Text>
      <Text style={styles.subheading}>
        오른쪽 폰 화면에서 직접 입력해보세요
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>데모 약 카탈로그</Text>
        {DEMO_DRUGS.map((drug) => (
          <View key={drug.name} style={styles.drugRow}>
            <Text style={styles.drugEmoji}>{drug.emoji}</Text>
            <View style={styles.drugTextWrap}>
              <Text style={styles.drugName}>{drug.name}</Text>
              <Text style={styles.drugDetail}>{drug.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.blockSection}>
        <Text style={styles.blockHeading}>🚫 BLOCK 시연 (병용금지)</Text>
        <Text style={styles.blockBody}>
          ① 자녀로 들어가기 → 어머니 카드{'\n'}
          ② 약장 → + 약 추가 → "메트포르민" 검색·선택{'\n'}
          ③ 다시 + 약 추가 → "이오헥솔" 검색·선택{'\n'}
          → 빨간 BLOCK 모달이 뜹니다
        </Text>
        <Text style={styles.blockSource}>
          출처: 식약처 고시 20110188{'\n'}
          (조영제 + 메트포르민 → 신부전 유산산성증 위험)
        </Text>
      </View>

      <View style={styles.warnSection}>
        <Text style={styles.warnHeading}>💡 추가 팁</Text>
        <Text style={styles.warnBody}>
          • 일정 추가: 메트포르민 상세 → "일정 추가"{'\n'}
          • 알림 탭: 슬롯별 그룹·먹음/거름 체크{'\n'}
          • 약 삭제 시 일정도 함께 삭제됩니다
        </Text>
      </View>
    </View>
  );
}

const styles = {
  panel: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
    gap: 14,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#2D2419',
  },
  subheading: {
    fontSize: 12,
    color: '#5C4A3A',
    marginTop: -8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#D97757',
    marginBottom: 2,
  },
  drugRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 4,
  },
  drugEmoji: {
    fontSize: 20,
  },
  drugTextWrap: {
    flex: 1,
  },
  drugName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#2D2419',
  },
  drugDetail: {
    fontSize: 11,
    color: '#8C7B66',
  },
  blockSection: {
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  blockHeading: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#C9302C',
  },
  blockBody: {
    fontSize: 11,
    color: '#2D2419',
    lineHeight: 17,
  },
  blockSource: {
    fontSize: 10,
    color: '#8C7B66',
    marginTop: 4,
    lineHeight: 15,
  },
  warnSection: {
    backgroundColor: '#FFF6E5',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  warnHeading: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#C97A30',
  },
  warnBody: {
    fontSize: 11,
    color: '#2D2419',
    lineHeight: 17,
  },
} as const;
