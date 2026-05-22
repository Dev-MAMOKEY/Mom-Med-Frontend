import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenContainerProps {
  header?: ReactNode;
  scrollable?: boolean;
  children?: ReactNode;
}

export function ScreenContainer({
  header,
  scrollable = true,
  children,
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      {header}

      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </SafeAreaView>
  );
}
