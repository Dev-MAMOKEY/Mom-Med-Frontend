import { useState } from 'react';
import { Image, Text, View } from 'react-native';

export type PillImageSize = 'sm' | 'md' | 'lg';
export type PillImageFallback = 'placeholder' | 'initials';

export interface PillImageProps {
  // 식약처 낱알식별 이미지 URL — 호출 측에서 PillVisual.item_image를 풀어 전달
  imageUrl?: string;
  // 폴백·접근성용 약 이름 (initials 폴백에서 첫 글자 표시)
  drugName: string;
  size?: PillImageSize;
  fallback?: PillImageFallback;
}

// 사이즈별 컨테이너 — 디자인 토큰 spacing(40·64·96)과 일치
const containerBySize: Record<PillImageSize, string> = {
  sm: 'w-10 h-10 rounded-md',
  md: 'w-16 h-16 rounded-lg',
  lg: 'w-24 h-24 rounded-xl',
};

const initialsTextBySize: Record<PillImageSize, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

// 약 이름 첫 글자 (한글·영문 모두 1자) — initials 폴백용
function initialFrom(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1) : '💊';
}

// 식약처 알약 이미지 + 로딩 스켈레톤 + URL 없거나 404 시 폴백 표시 (자녀 약장·약 상세에서 공통 사용)
export function PillImage({
  imageUrl,
  drugName,
  size = 'md',
  fallback = 'initials',
}: PillImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(imageUrl));

  const containerClass = `${containerBySize[size]} bg-primary-soft items-center justify-center overflow-hidden`;
  const showImage = imageUrl && !hasError;

  if (showImage) {
    return (
      <View className={containerClass}>
        {isLoading && (
          <View className="absolute inset-0 bg-surface-alt" />
        )}
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </View>
    );
  }

  if (fallback === 'placeholder') {
    return (
      <View className={containerClass}>
        <Text className={`${initialsTextBySize[size]} text-primary-bold`}>💊</Text>
      </View>
    );
  }

  return (
    <View className={containerClass}>
      <Text className={`font-bold ${initialsTextBySize[size]} text-primary-bold`}>
        {initialFrom(drugName)}
      </Text>
    </View>
  );
}
