// dev010 — SeverityPicker 한국어 라벨만 노출.
// 사용자 요청: 증상 강도 옵션이 영어(mild/moderate/severe) 없이 한글(가벼움/중간/심각)로만 표시되어야 함.

import { render } from '@testing-library/react-native';
import React from 'react';

import { SeverityPicker } from '@/components/domain/SeverityPicker';

describe('SeverityPicker — 한국어 라벨만 노출', () => {
  it('영어 라벨(mild/moderate/severe)이 화면에 노출되지 않는다', () => {
    const { queryByText } = render(
      <SeverityPicker value="moderate" onChange={() => {}} />,
    );
    expect(queryByText('mild')).toBeNull();
    expect(queryByText('moderate')).toBeNull();
    expect(queryByText('severe')).toBeNull();
  });

  it('한글 라벨(가벼움/중간/심각)이 모두 보인다', () => {
    const { getByText } = render(
      <SeverityPicker value="moderate" onChange={() => {}} />,
    );
    expect(getByText('가벼움')).toBeTruthy();
    expect(getByText('중간')).toBeTruthy();
    expect(getByText('심각')).toBeTruthy();
  });
});
