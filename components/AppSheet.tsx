import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/primitives';

export interface AppSheetProps {
  /** 열림 상태. true면 시트 present, false면 dismiss */
  open: boolean;
  /** 시트 닫힘 요청 시 호출 — 백드롭 클릭, pan-down close 등 모두 트리거 */
  onClose: () => void;
  /** 시트 높이 단계 — @gorhom BottomSheet 표준 */
  snapPoints: (string | number)[];
  children?: ReactNode;
}

// 앱 전역 바텀시트 — BottomSheet primitive(@gorhom) 위에 declarative API + 외부 클릭 닫기 백드롭을 얹은
// 고수준 컴포넌트. dev007에서 ParentSwitcher의 약장 선택 시트 + AppMenuButton의 역할 변경 시트를
// 일원화하기 위해 신설.
//
// 디자인: BottomSheet primitive 그대로 (흰 배경, 회색 핸들바, surface 토큰).
// 애니메이션: @gorhom의 슬라이드 (reanimated 기반).
// 외부 클릭 닫기: BottomSheetBackdrop + pressBehavior="close" — 백드롭 자체는 시각적으로 옅게
//   (opacity 0.3) 두어 #1 디자인에 가깝게.
export function AppSheet({ open, onClose, snapPoints, children }: AppSheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  // 하단 안전영역 inset — 시트 본체는 화면 끝까지 닿게 하고(@gorhom의 bottomInset은
  // 미전달), 콘텐츠 내부에만 paddingBottom으로 inset 적용. 그래야 시트 본체 아래 영역에
  // 백드롭(opacity 0.3 어두운 색)이 노출되는 줄이 안 보인다.
  const insets = useSafeAreaInsets();

  // open prop 변화에 따라 imperative present/dismiss 호출.
  // ⚠ 두 가지 함정:
  //   1. 첫 mount 시 dismiss 호출하면 BottomSheetModal이 잘못된 race state로 빠짐 → wasOpen 가드.
  //   2. @gorhom이 자체적으로 dismiss(백드롭 탭 등)한 직후 useEffect가 또 dismiss를 호출하면
  //      이후 present를 무시한다 → gorhomDismissed 플래그로 skip.
  const wasOpen = useRef(false);
  const gorhomDismissed = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      ref.current?.present();
      wasOpen.current = true;
      gorhomDismissed.current = false;
    } else if (!open && wasOpen.current) {
      // @gorhom가 이미 자체적으로 dismiss했으면 추가 호출 skip
      if (!gorhomDismissed.current) {
        ref.current?.dismiss();
      }
      wasOpen.current = false;
      gorhomDismissed.current = false;
    }
  }, [open]);

  // @gorhom의 onDismiss는 시트가 dismiss 완료된 후 호출됨 (백드롭 탭, pan-down close 등).
  // 부모에게 알리기 전에 플래그 세팅 → useEffect에서 중복 dismiss 호출 방지.
  const handleDismiss = useCallback(() => {
    gorhomDismissed.current = true;
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.3}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
    >
      <View
        testID="app-sheet-content-wrapper"
        style={{ paddingBottom: insets.bottom }}
      >
        {children}
      </View>
    </BottomSheet>
  );
}
