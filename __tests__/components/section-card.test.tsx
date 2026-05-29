// dev010 — SectionCard: 자식을 흰색 라운드 프레임 + 옅은 그림자로 감싸는 공용 wrapper.
// conditions.tsx의 기저질환·알레르기 섹션이 이 wrapper를 공유.

import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { SectionCard } from '@/components/SectionCard';

describe('SectionCard', () => {
  it('자식 요소를 그대로 렌더한다', () => {
    const { getByText } = render(
      <SectionCard>
        <Text>아이</Text>
      </SectionCard>,
    );
    expect(getByText('아이')).toBeTruthy();
  });

  it('section-card testID가 부착되어 있어 호출부에서 식별 가능하다', () => {
    const { getByTestId } = render(
      <SectionCard>
        <Text>아이</Text>
      </SectionCard>,
    );
    expect(getByTestId('section-card')).toBeTruthy();
  });
});
