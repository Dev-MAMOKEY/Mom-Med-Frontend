import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { useParents } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// [parentId] 부모 컨텍스트 — URL의 parentId를 currentParentStore에 동기화
export default function ParentScopedLayout() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const setParent = useCurrentParentStore((s) => s.setParent);
  const { data } = useParents();

  useEffect(() => {
    if (!parentId || !data) return;
    const found = data.parents.find((p) => p.parent_id === parentId);
    if (found) setParent(found.parent_id, found.display_name);
  }, [parentId, data, setParent]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
