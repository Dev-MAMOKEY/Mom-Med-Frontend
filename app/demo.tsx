import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Header, ScreenContainer, TabBar } from '@/components';
import type { TabId } from '@/components';
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Input,
  ListItem,
  Loading,
  Modal,
} from '@/components/primitives';
import type { BottomSheetRef } from '@/components/primitives';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="px-4 py-4 border-b border-border">
      <Text className="text-sm font-bold text-text-soft mb-3 uppercase">{title}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap gap-2 items-center">{children}</View>;
}

export default function DemoScreen() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('notifications');
  const [inputValue, setInputValue] = useState('');
  const sheetRef = useRef<BottomSheetRef>(null);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1">
        <ScreenContainer
          header={
            <Header
              title="Components Demo"
              showBack
              onBack={() => router.back()}
            />
          }
        >
          <Section title="ScreenContainer / Header">
            <Text className="text-sm text-text-soft">
              이 화면 전체가 ScreenContainer 로 감싸져 있고, 상단 타이틀 영역은 Header,
              하단 4탭은 TabBar 컴포넌트입니다.
            </Text>
          </Section>

          <Section title="Button">
            <Row>
              <Button label="Primary" variant="primary" onPress={() => {}} />
              <Button label="Secondary" variant="secondary" onPress={() => {}} />
              <Button label="Danger" variant="danger" onPress={() => {}} />
              <Button label="Ghost" variant="ghost" onPress={() => {}} />
            </Row>
            <Row>
              <Button label="Small" size="sm" onPress={() => {}} />
              <Button label="Medium" size="md" onPress={() => {}} />
              <Button label="Large" size="lg" onPress={() => {}} />
            </Row>
            <Row>
              <Button label="Loading" loading onPress={() => {}} />
              <Button label="Disabled" disabled onPress={() => {}} />
            </Row>
          </Section>

          <Section title="Input">
            <Input
              label="기본"
              placeholder="이름을 입력하세요"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Input
              label="전화"
              placeholder="010-0000-0000"
              variant="tel"
              prefix="+82"
            />
            <Input
              label="에러 상태"
              value="invalid"
              error="형식이 올바르지 않습니다"
            />
          </Section>

          <Section title="Card">
            <Card>
              <Text className="text-base font-bold text-text">기본 카드</Text>
              <Text className="text-sm text-text-soft mt-1">surface 배경 + rounded-lg</Text>
            </Card>
            <Card variant="outlined">
              <Text className="text-base text-text">Outlined</Text>
            </Card>
            <Card pressable onPress={() => {}}>
              <Text className="text-base text-text">Pressable Card</Text>
            </Card>
          </Section>

          <Section title="Badge">
            <Row>
              <Badge label="Success" variant="success" />
              <Badge label="Warning" variant="warning" />
              <Badge label="Danger" variant="danger" />
              <Badge label="Info" variant="info" />
            </Row>
            <Row>
              <Badge label="관심" variant="관심" />
              <Badge label="주의" variant="주의" />
              <Badge label="경고" variant="경고" />
              <Badge label="위험" variant="위험" />
            </Row>
          </Section>

          <Section title="Avatar">
            <Row>
              <Avatar name="김엄마" size="sm" />
              <Avatar name="김엄마" size="md" />
              <Avatar name="김엄마" size="lg" />
              <Avatar name="김엄마" size="xl" />
            </Row>
            <Row>
              <Avatar name="부모" role="parent" />
              <Avatar name="자녀" role="caregiver" />
            </Row>
          </Section>

          <Section title="ListItem">
            <View className="bg-surface rounded-lg overflow-hidden">
              <ListItem title="첫 번째 항목" subtitle="설명 텍스트" onPress={() => {}} />
              <ListItem title="두 번째 항목" subtitle="설명 텍스트" onPress={() => {}} />
              <ListItem title="컴팩트" size="compact" onPress={() => {}} />
            </View>
          </Section>

          <Section title="EmptyState">
            <EmptyState
              title="데이터가 없어요"
              description="새 항목을 추가해보세요"
              cta={{ label: '추가하기', onPress: () => {} }}
            />
          </Section>

          <Section title="Loading">
            <Loading text="불러오는 중..." />
          </Section>

          <Section title="Modal / BottomSheet">
            <Row>
              <Button label="Modal 열기" onPress={() => setModalOpen(true)} />
              <Button
                label="BottomSheet 열기"
                variant="secondary"
                onPress={() => sheetRef.current?.expand()}
              />
            </Row>
          </Section>

          <View className="h-8" />
        </ScreenContainer>

        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={['40%']}
          enablePanDownToClose
        >
          <View className="px-6 py-4">
            <Text className="text-lg font-bold text-text">BottomSheet</Text>
            <Text className="text-sm text-text-soft mt-2">
              @gorhom/bottom-sheet 래핑. 아래로 스와이프하여 닫을 수 있습니다.
            </Text>
          </View>
        </BottomSheet>
      </View>

      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Text className="text-lg font-bold text-text">Modal</Text>
        <Text className="text-sm text-text-soft mt-2">
          중앙 정렬 모달. 백드롭을 탭하면 닫힙니다.
        </Text>
        <View className="mt-4">
          <Button label="닫기" onPress={() => setModalOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}
