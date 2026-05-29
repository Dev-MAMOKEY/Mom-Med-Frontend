// userProfileStore 동작 명세
// - 기본값: 데모 사용자 (displayName, email) 노출
// - clear() 호출 시 빈 값으로 리셋 (역할 변경/로그아웃 시 사용)
//
// 구현 세부 (Zustand 내부 구조)가 아니라 공개 인터페이스만 검증.

import { useUserProfileStore } from './userProfileStore';

describe('userProfileStore', () => {
  beforeEach(() => {
    // 다른 테스트의 영향 격리
    useUserProfileStore.setState({ displayName: '홍길동', email: 'demo@mommed.app' });
  });

  it('기본값으로 데모 사용자 정보를 노출한다', () => {
    const { displayName, email } = useUserProfileStore.getState();
    expect(displayName).toBe('홍길동');
    expect(email).toBe('demo@mommed.app');
  });

  it('clear() 호출 시 displayName과 email이 빈 문자열이 된다', () => {
    useUserProfileStore.getState().clear();
    const { displayName, email } = useUserProfileStore.getState();
    expect(displayName).toBe('');
    expect(email).toBe('');
  });
});
