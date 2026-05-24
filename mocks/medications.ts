import { SafetyBlockError } from '@/api/client';
import type {
  AddMedicationReq,
  AddMedicationRes,
  DrugDetail,
  Medication,
  MedicationList,
  OverallSafetyCheck,
} from '@/api/types';

// ============================================================================
// 1) 부모별 약장 (mom-001 4개 · dad-001 0개)
// ============================================================================

const momMedications: Medication[] = [
  {
    item_seq: '202106092',
    item_name: '타이레놀정 500mg',
    main_ingr_en: 'Acetaminophen',
    atc_code: 'N02BE01',
    specialty_type: 'OTC',
    dosage_schedule: '필요시',
    added_at: '2026-05-01T08:00:00Z',
  },
  {
    item_seq: '200610660',
    item_name: '노바스크정 5mg',
    main_ingr_en: 'Amlodipine Besylate',
    atc_code: 'C08CA01',
    specialty_type: 'ETC',
    dosage_schedule: '1일 1회 · 아침',
    added_at: '2026-05-01T08:00:00Z',
  },
  {
    item_seq: '198800001',
    item_name: '와파린정 2mg',
    main_ingr_en: 'Warfarin Sodium',
    atc_code: 'B01AA03',
    specialty_type: 'ETC',
    dosage_schedule: '1일 1회 · 아침',
    added_at: '2026-05-01T08:00:00Z',
  },
  {
    item_seq: '198800002',
    item_name: '메트포르민 500mg',
    main_ingr_en: 'Metformin',
    atc_code: 'A10BA02',
    specialty_type: 'ETC',
    dosage_schedule: '1일 2회 · 식후',
    added_at: '2026-05-01T08:00:00Z',
  },
];

export const mockMedications = async (parentId: string): Promise<MedicationList> => {
  if (parentId === 'mom-001') return { medications: momMedications };
  return { medications: [] };
};

// ============================================================================
// 2) 사전 약장 안전 점검 — 현재 약장(아스피린 없음)은 ALLOW
// ============================================================================

export const mockSafetyCheck = async (
  _parentId: string,
): Promise<OverallSafetyCheck> => ({
  overall_decision: 'ALLOW',
  evidences: [],
});

// ============================================================================
// 3) 약 검색 — 카탈로그에서 부분 문자열 매칭 (한글·영문 모두)
// ============================================================================

const searchCatalog: Medication[] = [
  ...momMedications,
  {
    item_seq: 'aspirin-100',
    item_name: '아스피린프로텍트정 100mg',
    main_ingr_en: 'Aspirin',
    atc_code: 'B01AC06',
    specialty_type: 'OTC',
    added_at: '2026-05-01T08:00:00Z',
  },
  {
    item_seq: 'cimetidine-200',
    item_name: '시메티딘정 200mg',
    main_ingr_en: 'Cimetidine',
    atc_code: 'A02BA01',
    specialty_type: 'OTC',
    added_at: '2026-05-01T08:00:00Z',
  },
  {
    item_seq: 'grapefruit-juice',
    item_name: '자몽주스 (예시 음료)',
    main_ingr_en: 'Grapefruit Juice',
    atc_code: null,
    specialty_type: null,
    added_at: '2026-05-01T08:00:00Z',
  },
];

export const mockDrugSearch = async (
  query: string,
): Promise<{ results: Medication[] }> => {
  const q = query.trim().toLowerCase();
  if (!q) return { results: [] };
  const results = searchCatalog.filter(
    (m) =>
      m.item_name.toLowerCase().includes(q) ||
      (m.main_ingr_en?.toLowerCase().includes(q) ?? false),
  );
  return { results };
};

// ============================================================================
// 4) 약 상세 (식약처 알약 이미지 + 주의사항)
// ============================================================================

// 식약처 낱알식별 CDN URL 패턴 — placeholder까지 fallback은 PillImage 컴포넌트가 처리
const pillImageUrl = (itemSeq: string) =>
  `https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemImageDetail?id=${itemSeq}`;

const drugDetails: Record<string, DrugDetail> = {
  '202106092': {
    item_seq: '202106092',
    item_name: '타이레놀정 500mg',
    main_ingr_en: 'Acetaminophen',
    atc_code: 'N02BE01',
    specialty_type: 'OTC',
    manufacturer: '한국얀센',
    pill_visual: {
      item_image: pillImageUrl('202106092'),
      drug_shape: '장방형',
      color_class1: '하양',
      print_front: 'TYLENOL 500',
      leng_long: 17,
      leng_short: 7,
      thick: 5,
    },
    cautions: [
      {
        type: 'warning',
        title: '간 손상 위험',
        body: '1일 4g(8정) 초과 복용 금지. 음주 시 복용 자제.',
        source: '식약처 NB_DOC_DATA',
      },
    ],
  },
  '200610660': {
    item_seq: '200610660',
    item_name: '노바스크정 5mg',
    main_ingr_en: 'Amlodipine Besylate',
    atc_code: 'C08CA01',
    specialty_type: 'ETC',
    manufacturer: '한국화이자',
    pill_visual: {
      item_image: pillImageUrl('200610660'),
      drug_shape: '팔각형',
      color_class1: '하양',
      print_front: 'NVR',
      leng_long: 8,
      leng_short: 8,
      thick: 3,
    },
    cautions: [
      {
        type: 'warning',
        title: '자몽주스 병용 주의',
        body: '자몽주스와 함께 복용 시 혈중농도가 상승할 수 있음.',
        source: '식약처 NB_DOC_DATA',
      },
    ],
  },
  '198800001': {
    item_seq: '198800001',
    item_name: '와파린정 2mg',
    main_ingr_en: 'Warfarin Sodium',
    atc_code: 'B01AA03',
    specialty_type: 'ETC',
    manufacturer: '제일약품',
    pill_visual: {
      item_image: pillImageUrl('198800001'),
      drug_shape: '원형',
      color_class1: '연보라',
      print_front: 'W2',
      leng_long: 6,
      leng_short: 6,
      thick: 3,
    },
    cautions: [
      {
        type: 'warning',
        title: '출혈 위험',
        body: '아스피린·NSAID 병용 금지. 잇몸·코피·멍 자주 생기면 의사 상담.',
        source: '식약처 NB_DOC_DATA',
      },
    ],
  },
  '198800002': {
    item_seq: '198800002',
    item_name: '메트포르민 500mg',
    main_ingr_en: 'Metformin',
    atc_code: 'A10BA02',
    specialty_type: 'ETC',
    manufacturer: '대웅제약',
    pill_visual: {
      item_image: pillImageUrl('198800002'),
      drug_shape: '원형',
      color_class1: '하양',
      print_front: 'M500',
      leng_long: 12,
      leng_short: 12,
      thick: 5,
    },
    cautions: [
      {
        type: 'info',
        title: '복용 시점',
        body: '식후 즉시 복용 시 위장장애 완화.',
        source: '식약처 NB_DOC_DATA',
      },
    ],
  },
  'aspirin-100': {
    item_seq: 'aspirin-100',
    item_name: '아스피린프로텍트정 100mg',
    main_ingr_en: 'Aspirin',
    atc_code: 'B01AC06',
    specialty_type: 'OTC',
    manufacturer: '바이엘코리아',
    cautions: [
      {
        type: 'warning',
        title: '항응고제 병용 금지',
        body: '와파린 등 항응고제와 함께 복용 시 출혈 위험 증가.',
        source: '식약처 NB_DOC_DATA',
      },
    ],
  },
};

export const mockDrugDetail = async (itemSeq: string): Promise<DrugDetail> => {
  const found = drugDetails[itemSeq];
  if (found) return found;
  // fallback — 최소 필드만 가진 DrugDetail
  return {
    item_seq: itemSeq,
    item_name: `약 ${itemSeq}`,
    main_ingr_en: null,
    atc_code: null,
    specialty_type: null,
    cautions: [],
  };
};

// ============================================================================
// 5) 약 추가 — 시나리오 3종 (BLOCK · WARN · ALLOW)
//    백엔드 04 v2.1 응답 구조에 정확히 정렬:
//      - BLOCK: HTTP 409 + SafetyBlockError throw
//      - WARN/ALLOW: HTTP 201 + AddMedicationRes (safety_check.decision)
// ============================================================================

const warfarinAsConflicting: Medication = {
  item_seq: '198800001',
  item_name: '와파린정 2mg',
  main_ingr_en: 'Warfarin Sodium',
  atc_code: 'B01AA03',
  specialty_type: 'ETC',
  added_at: '2026-05-01T08:00:00Z',
};

const randomMedId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2)}`;

export const mockAddMedication = async (
  _parentId: string,
  req: AddMedicationReq,
): Promise<AddMedicationRes> => {
  // BLOCK: 아스피린 + 와파린 (동시 출혈 위험)
  if (req.item_seq === 'aspirin-100') {
    throw new SafetyBlockError({
      error: 'block',
      verdict: {
        decision: 'BLOCK',
        evidences: [
          {
            source: 'DUR',
            severity: 'high',
            message: '두 약 모두 혈액응고를 억제해 출혈 위험이 증가합니다',
            conflicting_drug: warfarinAsConflicting,
          },
          {
            source: 'NB',
            severity: 'high',
            message: '식약처 허가사항 원문',
            citation:
              '아스피린과 병용 투여하지 않는 것이 권장된다. 출혈 위험이 증가할 수 있다.',
            citation_source: '와파린정 사용상의주의사항 (NB_DOC_DATA)',
          },
        ],
      },
    });
  }

  // WARN: 시메티딘 + 와파린 (혈중농도 상승 가능)
  if (req.item_seq === 'cimetidine-200') {
    return {
      medication_id: randomMedId('new-med-cimetidine'),
      item_seq: 'cimetidine-200',
      safety_check: {
        decision: 'WARN',
        evidences: [
          {
            source: 'NB',
            severity: 'medium',
            message:
              '와파린과 병용 시 혈중농도 상승 가능 — 출혈 시간 모니터링 권장',
            conflicting_drug: warfarinAsConflicting,
            citation:
              '시메티딘은 와파린의 대사를 억제하여 항응고 효과를 증강시킬 수 있다.',
            citation_source: '시메티딘정 사용상의주의사항',
          },
        ],
      },
    };
  }

  // WARN: 자몽주스 + 노바스크(암로디핀) — 혈중농도 상승
  if (req.item_seq === 'grapefruit-juice') {
    return {
      medication_id: randomMedId('new-med-gj'),
      item_seq: 'grapefruit-juice',
      safety_check: {
        decision: 'WARN',
        evidences: [
          {
            source: 'NB',
            severity: 'medium',
            message:
              '암로디핀(노바스크)과 자몽주스 병용 시 약물 혈중농도 상승',
            citation:
              '자몽주스는 CCB 계열 약물의 대사를 억제할 수 있다.',
            citation_source: '노바스크정 사용상의주의사항',
          },
        ],
      },
    };
  }

  // ALLOW: 그 외 — 정상 추가
  return {
    medication_id: randomMedId('new-med'),
    item_seq: req.item_seq,
    safety_check: {
      decision: 'ALLOW',
      evidences: [],
    },
  };
};
