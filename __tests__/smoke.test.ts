// Jest 셋업이 동작하는지 확인하는 스모크 테스트.
// 이 테스트가 통과해야 Phase 1 사이클을 시작할 수 있다.

describe('jest setup', () => {
  it('runs basic assertions', () => {
    expect(1 + 1).toBe(2);
  });
});
