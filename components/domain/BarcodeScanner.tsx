import { useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import type { BarCodeScannerResult } from 'expo-barcode-scanner';

export interface BarcodeScanResult {
  type: string;
  data: string;
}

export interface BarcodeScannerProps {
  onScan: (result: BarcodeScanResult) => void;
  onError?: (err: Error) => void;
  guideText?: string;
}

// 같은 코드 연속 인식 방지용 쿨다운 (ms)
const SCAN_COOLDOWN_MS = 1000;

// expo-barcode-scanner 래핑 — 가이드 박스·안내 텍스트·1초 디바운스 (카메라 권한은 화면에서 처리)
export function BarcodeScanner({
  onScan,
  onError,
  guideText = '약 포장의 바코드를 비춰주세요',
}: BarcodeScannerProps) {
  const lastScanRef = useRef<{ data: string; at: number } | null>(null);

  const handleScanned = useCallback(
    (event: BarCodeScannerResult) => {
      try {
        const now = Date.now();
        const last = lastScanRef.current;
        if (last && last.data === event.data && now - last.at < SCAN_COOLDOWN_MS) {
          return;
        }
        lastScanRef.current = { data: event.data, at: now };
        onScan({ type: event.type, data: event.data });
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [onScan, onError],
  );

  return (
    <View className="relative w-full h-full overflow-hidden rounded-xl bg-text">
      <BarCodeScanner
        onBarCodeScanned={handleScanned}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="absolute inset-0 items-center justify-center">
        <View className="w-56 h-40 border-2 border-primary rounded-md relative">
          <View className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary" />
          <View className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary" />
          <View className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary" />
          <View className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary" />
          <View className="absolute left-2 right-2 top-1/2 h-0.5 bg-primary-bold" />
        </View>
      </View>

      <View className="absolute bottom-4 left-0 right-0 items-center">
        <Text className="text-sm font-bold text-surface">{guideText}</Text>
      </View>
    </View>
  );
}
