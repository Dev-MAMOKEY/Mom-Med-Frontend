import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { ConditionTag } from '@/components/domain';
import { Button, EmptyState, Loading } from '@/components/primitives';
import { useConditions, useDeleteCondition } from '@/hooks';
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

  const title = `${displayName ?? '부모님'} 질병·알레르기`;
  const header = <Header title={title} showBack onBack={onBack} />;

  const conditions = condData?.conditions ?? [];

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
      </View>
    </ScreenContainer>
  );
}
