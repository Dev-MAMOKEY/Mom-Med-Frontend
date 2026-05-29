import { Bell } from 'lucide-react-native';

import { AppMenuButton, Header, ScreenContainer } from '@/components';
import { EmptyState } from '@/components/primitives';

// 자녀 시점 알림 화면 — Phase 2에서 실제 알림 리스트로 교체
export default function CaregiverNotifications() {
  return (
    <ScreenContainer header={<Header title="알림" right={<AppMenuButton />} />}>
      <EmptyState
        icon={Bell}
        title="준비 중인 기능이에요"
        description="알림 기능은 곧 제공될 예정입니다"
      />
    </ScreenContainer>
  );
}
