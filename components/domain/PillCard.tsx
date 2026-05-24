import { Text, View } from 'react-native';

import type { DrugDetail, DrugCaution } from '@/api/types/medication';
import { Badge } from '@/components/primitives';
import { PillImage } from './PillImage';

export interface PillCardProps {
  drug: DrugDetail;
  showCautions?: boolean;
  showDosage?: boolean;
}

// 처방/일반약 한국어 라벨
function specialtyLabel(type: DrugDetail['specialty_type']): string | null {
  if (type === 'ETC') return '처방약';
  if (type === 'OTC') return '일반약';
  return null;
}

// 외형 텍스트 — pill_visual.drug_shape + color_class1 조합
function shapeLabel(drug: DrugDetail): string | null {
  const pv = drug.pill_visual;
  if (!pv) return null;
  return [pv.drug_shape, pv.color_class1].filter(Boolean).join('·');
}

// 크기 텍스트 — pill_visual.leng_long × leng_short mm
function sizeLabel(drug: DrugDetail): string | null {
  const pv = drug.pill_visual;
  if (!pv) return null;
  return `${pv.leng_long}×${pv.leng_short}mm`;
}

// 단일 주의/정보 카드 — type별 컬러 분기
function CautionCard({ caution }: { caution: DrugCaution }) {
  const isWarning = caution.type === 'warning';
  const bg = isWarning ? 'bg-warning-soft' : 'bg-info-soft';
  const fg = isWarning ? 'text-warning' : 'text-info';
  const icon = isWarning ? '⚠️' : 'ℹ️';
  return (
    <View className={`${bg} rounded-lg p-3.5`}>
      <View className="flex-row items-start gap-2">
        <Text className={`text-lg ${fg}`}>{icon}</Text>
        <View className="flex-1">
          <Text className={`text-xs font-bold ${fg} mb-1`}>{caution.title}</Text>
          <Text className="text-[11px] text-text-soft leading-relaxed">
            {caution.body}
          </Text>
          <Text className="text-[10px] text-text-mute mt-1">
            출처: {caution.source}
          </Text>
        </View>
      </View>
    </View>
  );
}

// 약 상세 카드 — 식약처 알약 사진 + 성분/ATC/외형/크기 그리드 + 주의사항·복용 정보
export function PillCard({
  drug,
  showCautions = true,
  showDosage = false,
}: PillCardProps) {
  const specialty = specialtyLabel(drug.specialty_type);
  const shape = shapeLabel(drug);
  const size = sizeLabel(drug);

  return (
    <View>
      <View className="bg-surface border border-border rounded-xl p-6 items-center justify-center">
        <PillImage
          imageUrl={drug.pill_visual?.item_image}
          drugName={drug.item_name}
          size="lg"
        />
        <Text className="text-[10px] text-text-mute mt-3">식약처 낱알식별 정보</Text>
      </View>

      <View className="mt-4 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-xl font-extrabold text-text">{drug.item_name}</Text>
          {drug.manufacturer && (
            <Text className="text-sm text-text-soft mt-0.5">{drug.manufacturer}</Text>
          )}
        </View>
        {specialty && (
          <Badge
            label={specialty}
            variant={specialty === '처방약' ? 'info' : 'success'}
            size="sm"
          />
        )}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {drug.main_ingr_en && (
          <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-md p-3">
            <Text className="text-[10px] font-semibold text-text-mute">성분</Text>
            <Text className="text-sm font-bold text-text mt-0.5">
              {drug.main_ingr_en}
            </Text>
          </View>
        )}
        {drug.atc_code && (
          <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-md p-3">
            <Text className="text-[10px] font-semibold text-text-mute">ATC</Text>
            <Text className="text-sm font-bold text-text mt-0.5 font-mono">
              {drug.atc_code}
            </Text>
          </View>
        )}
        {shape && (
          <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-md p-3">
            <Text className="text-[10px] font-semibold text-text-mute">외형</Text>
            <Text className="text-sm font-bold text-text mt-0.5">{shape}</Text>
          </View>
        )}
        {size && (
          <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-md p-3">
            <Text className="text-[10px] font-semibold text-text-mute">크기</Text>
            <Text className="text-sm font-bold text-text mt-0.5">{size}</Text>
          </View>
        )}
      </View>

      {showCautions && drug.cautions.length > 0 && (
        <View className="mt-4 gap-2">
          {drug.cautions.map((c, i) => (
            <CautionCard key={`${c.type}-${i}`} caution={c} />
          ))}
        </View>
      )}

      {showDosage && (
        <View className="mt-3 bg-primary-soft rounded-lg p-3.5">
          <Text className="text-xs font-bold text-primary-bold">복용 일정</Text>
          <Text className="text-sm font-semibold text-text mt-1">
            의사·약사 지시에 따라 복용
          </Text>
        </View>
      )}
    </View>
  );
}
