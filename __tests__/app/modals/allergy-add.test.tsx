// dev010 — 알레르기 추가 버튼 라벨이 한글 강도로 표시되어야 함.
// "우유 (moderate) 추가" → "우유 (중간) 추가"

import { computeAddButtonLabel } from '@/utils/severity';

describe('알레르기 추가 버튼 라벨', () => {
  it('이름과 강도가 있으면 한글 강도를 포함해 "X (한글강도) 추가" 형태', () => {
    expect(computeAddButtonLabel('우유', 'moderate')).toBe('우유 (중간) 추가');
    expect(computeAddButtonLabel('땅콩', 'mild')).toBe('땅콩 (가벼움) 추가');
    expect(computeAddButtonLabel('페니실린', 'severe')).toBe(
      '페니실린 (심각) 추가',
    );
  });

  it('이름 양옆 공백은 trim한다', () => {
    expect(computeAddButtonLabel('  우유  ', 'moderate')).toBe(
      '우유 (중간) 추가',
    );
  });

  it('이름이 비어 있으면 단순 "추가"', () => {
    expect(computeAddButtonLabel('', 'moderate')).toBe('추가');
    expect(computeAddButtonLabel('   ', 'moderate')).toBe('추가');
  });

  it('영어 강도(mild/moderate/severe)가 라벨에 노출되지 않는다', () => {
    const labels = [
      computeAddButtonLabel('우유', 'mild'),
      computeAddButtonLabel('우유', 'moderate'),
      computeAddButtonLabel('우유', 'severe'),
    ];
    for (const l of labels) {
      expect(l).not.toMatch(/mild|moderate|severe/);
    }
  });
});
