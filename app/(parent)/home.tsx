import { View } from 'react-native';

import { AppMenuButton, Header, ScreenContainer } from '@/components';
import { EmptyState } from '@/components/primitives';
import { Wrench } from 'lucide-react-native';

// 부모 홈 placeholder — F2 이슈에서 실제 약장 화면으로 교체.
// dev006: AppMenuButton 추가 — placeholder라도 메뉴를 통해 역할 변경으로 탈출 가능.
export default function ParentHome() {
  return (
    <ScreenContainer header={<Header title="내 약장" right={<AppMenuButton />} />}>
      <View className="flex-1">
        <EmptyState
          icon={Wrench}
          title="준비 중이에요"
          description="내 약장 기능은 곧 제공될 예정입니다"
        />
      </View>
    </ScreenContainer>
  );
}
