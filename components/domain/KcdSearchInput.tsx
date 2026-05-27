import { useState } from 'react';
import { View } from 'react-native';

import type { DiseaseSearchResult } from '@/api/types';
import { EmptyState, Input, ListItem, Loading } from '@/components/primitives';
import { useDebouncedValue, useDiseaseSearch } from '@/hooks';

export interface KcdSearchInputProps {
  onSelect: (result: DiseaseSearchResult) => void;
  placeholder?: string;
}

// KCD 코드/한글명 검색 입력 + 결과 리스트 — 300ms 디바운스 후 useDiseaseSearch(>=2글자) 호출
export function KcdSearchInput({
  onSelect,
  placeholder = '질병 코드 또는 한글명',
}: KcdSearchInputProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data, isLoading } = useDiseaseSearch(debouncedQuery);

  const showEmpty =
    !isLoading && debouncedQuery.length >= 2 && data?.results.length === 0;

  return (
    <View className="gap-2">
      <Input
        variant="search"
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        autoFocus
      />

      {isLoading && <Loading size="sm" />}

      {showEmpty && (
        <EmptyState
          title="검색 결과가 없어요"
          description="다른 키워드로 검색해 보세요"
        />
      )}

      {data?.results.map((r) => (
        <ListItem
          key={r.sickCd}
          title={r.sickCd}
          subtitle={`${r.sickNm} · ${r.sickEngNm}`}
          onPress={() => onSelect(r)}
        />
      ))}
    </View>
  );
}
