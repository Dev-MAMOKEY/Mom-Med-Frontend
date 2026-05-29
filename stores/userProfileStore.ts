import { create } from 'zustand';

// 로그인 사용자 프로필. 데모 단계에서는 BE에 사용자 API가 없어 하드코딩된 기본값으로 출발.
// 추후 인증 들어오면 set으로 갱신, 로그아웃/역할변경 시 clear().
interface UserProfileState {
  displayName: string;
  email: string;
  clear: () => void;
}

const DEFAULT_DISPLAY_NAME = '홍길동';
const DEFAULT_EMAIL = 'demo@mommed.app';

export const useUserProfileStore = create<UserProfileState>()((set) => ({
  displayName: DEFAULT_DISPLAY_NAME,
  email: DEFAULT_EMAIL,
  clear: () => set({ displayName: '', email: '' }),
}));
