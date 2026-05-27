import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { AllergyTag, ConditionTag } from '@/components/domain';
import { Button, EmptyState, Loading } from '@/components/primitives';
import {
  useAllergies,
  useConditions,
  useDeleteAllergy,
  useDeleteCondition,
} from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// 자녀 → 부모 질병·알레르기 화면 (F3) — 본 커밋은 기저질환 섹션만, 알레르기는 다음 커밋에서 추가
export default function ConditionsScreen() {
  // meds.tsx와 동일 패턴 — Tabs 자식에서 URL 파라미터가 누락되는 케이스 대비 store fallback
  const { parentId: urlParentId } = useLocalSearchParams<{ parentId: string }>();
  const storeParentId = useCurrentParentStore((s) => s.parentId);
  const parentId = urlParentId || storeParentId || '';
  const displayName = useCurrentParentStore((s) => s.displayName);

  const { data: condData, isLoading: condLoading } = useConditions(parentId);
  const { mutate: deleteCondition } = useDeleteCondition(parentId);
  const { data: algData, isLoading: algLoading } = useAllergies(parentId);
  const { mutate: deleteAllergy } = useDeleteAllergy(parentId);

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(caregiver)/parents');
  };

  const goAddCondition = () => {
    router.push({
      pathname: '/(modals)/condition-add',
      params: { parentId },
    });
  };

  const goAddAllergy = () => {
    router.push({
      pathname: '/(modals)/allergy-add',
      params: { parentId },
    });
  };

  const title = `${displayName ?? '부모님'} 질병·알레르기`;
  const header = <Header title={title} showBack onBack={onBack} />;

  const conditions = condData?.conditions ?? [];
  const allergies = algData?.allergies ?? [];

  return (
    <ScreenContainer header={header}>
      <View className="px-5 pt-2 pb-24 gap-3">
        {/* 기저질환 섹션 */}
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm font-bold text-text">🩺 기저질환</Text>
          <Text className="text-xs text-text-mute">{conditions.length}건</Text>
        </View>

        {condLoading ? (
          <Loading size="sm" />
        ) : conditions.length === 0 ? (
          <EmptyState title="등록된 질병이 없어요" />
        ) : (
          <View className="gap-2">
            {conditions.map((c) => (
              <ConditionTag
                key={c.condition_id}
                code={c.disease_code}
                name={c.disease_name}
                variant="card"
                onRemove={() => deleteCondition(c.condition_id)}
              />
            ))}
          </View>
        )}

        <Button
          label="+ 질병 추가"
          variant="secondary"
          onPress={goAddCondition}
        />

        {/* 알레르기 섹션 */}
        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-sm font-bold text-text">⚠️ 알레르기</Text>
          <Text className="text-xs text-text-mute">{allergies.length}건</Text>
        </View>

        {algLoading ? (
          <Loading size="sm" />
        ) : allergies.length === 0 ? (
          <EmptyState title="등록된 알레르기가 없어요" />
        ) : (
          <View className="gap-2">
            {allergies.map((a) => (
              <AllergyTag
                key={a.allergy_id}
                type={a.allergen_type}
                name={a.allergen_name}
                severity={a.severity}
                notes={a.notes ?? undefined}
                variant="card"
                onRemove={() => deleteAllergy(a.allergy_id)}
              />
            ))}
          </View>
        )}

        <Button
          label="+ 알레르기 추가"
          variant="secondary"
          onPress={goAddAllergy}
        />

        {/* 안내 — 목업 v2 화면 13번 하단 안내 박스 */}
        <View className="mt-3 bg-info-soft rounded-md p-3">
          <Text className="text-xs text-text-soft leading-relaxed">
            <Text className="font-bold text-info">💡 </Text>
            등록한 질병·알레르기는 약 추가 시 자동으로 안전판정에 사용돼요.
            응급카드에도 즉시 반영됩니다.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
