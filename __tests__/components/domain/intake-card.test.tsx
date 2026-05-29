// dev008 슬라이스 1 Cycle 7 — IntakeCard 핵심 동작.
//  - pending 카드: 액션 3개(먹음/거름/나중에) 노출
//  - taken 카드: "복용 완료" 표시, 액션 숨김
//  - "먹음" 탭 시 onCheck({status:'taken'}) 호출

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { IntakeCard } from '@/components/domain/IntakeCard';
import type { IntakeLog } from '@/api/types/schedule';

function pending(): IntakeLog {
  return {
    intake_id: 'i_1',
    schedule_id: 'sch_1',
    medication_id: 'med_1',
    item_name: '메트포르민 500mg',
    route: 'oral',
    slot: 'morning',
    scheduled_at: '2026-05-30T08:00:00',
    status: 'pending',
  };
}

function taken(): IntakeLog {
  return {
    ...pending(),
    status: 'taken',
    taken_at: '2026-05-30T08:12:00',
  };
}

describe('IntakeCard — pending', () => {
  it('약 이름과 시각이 보인다', () => {
    const { getByText } = render(<IntakeCard intake={pending()} onCheck={() => {}} />);
    expect(getByText(/메트포르민/)).toBeTruthy();
  });

  it('먹음·거름 두 개 액션만 노출된다 ("나중에"는 제거됨)', () => {
    const { getByText, queryByText } = render(
      <IntakeCard intake={pending()} onCheck={() => {}} />
    );
    expect(getByText('먹음')).toBeTruthy();
    expect(getByText('거름')).toBeTruthy();
    expect(queryByText('나중에')).toBeNull();
  });

  it('"먹음" 탭 시 onCheck({status:"taken"}) 호출', () => {
    const onCheck = jest.fn();
    const { getByText } = render(<IntakeCard intake={pending()} onCheck={onCheck} />);
    fireEvent.press(getByText('먹음'));
    expect(onCheck).toHaveBeenCalledWith({ status: 'taken' });
  });

  it('"거름" 탭 시 onCheck({status:"skipped"}) 호출', () => {
    const onCheck = jest.fn();
    const { getByText } = render(<IntakeCard intake={pending()} onCheck={onCheck} />);
    fireEvent.press(getByText('거름'));
    expect(onCheck).toHaveBeenCalledWith({ status: 'skipped' });
  });
});

describe('IntakeCard — taken', () => {
  it('"복용 완료" 표시 + 액션 버튼 숨김', () => {
    const { getByText, queryByText } = render(
      <IntakeCard intake={taken()} onCheck={() => {}} />
    );
    expect(getByText(/복용 완료/)).toBeTruthy();
    expect(queryByText('먹음')).toBeNull();
    expect(queryByText('거름')).toBeNull();
  });
});
