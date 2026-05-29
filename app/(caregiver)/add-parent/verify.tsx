import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { VerificationCodeInput } from '@/components/domain';
import { useCountdown, useRequestVerify, useVerifyParent } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

const CODE_LENGTH = 4;
const COUNTDOWN_SEC = 180;
const SUCCESS_TOAST_MS = 1200;
// MVP — request_id는 mock 고정. 출시 시 phone 화면에서 받아 params로 전달.
const MOCK_REQUEST_ID = 'mock-req-001';

// 부모 등록 2단계 — 인증 코드 입력 (MVP: 0000 통과)
export default function AddParentVerify() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  const countdown = useCountdown(COUNTDOWN_SEC, { autoStart: true });
  const { mutate: verify, isPending: verifying } = useVerifyParent();
  const { mutate: requestVerify, isPending: resending } = useRequestVerify();

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(caregiver)/parents');
  };

  const onChange = (next: string) => {
    setCode(next);
    if (error) setError(undefined);
  };

  // 4자리 입력 완료 시 자동 검증
  const onComplete = (entered: string) => {
    if (!phone) return;
    verify(
      { phone, code: entered, request_id: MOCK_REQUEST_ID },
      {
        onSuccess: (res) => {
          useCurrentParentStore.getState().setParent(res.parent_id, res.display_name);
          setToast('부모님 등록 완료 🎉');
        },
        onError: () => {
          setError('인증 코드가 일치하지 않습니다');
          setCode('');
        },
      },
    );
  };

  // 토스트 표시 → 1.2초 후 부모 컨텍스트 홈으로 replace
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => {
      const { parentId } = useCurrentParentStore.getState();
      if (parentId) {
        router.replace({
          pathname: '/(caregiver)/[parentId]/notifications',
          params: { parentId },
        });
      }
    }, SUCCESS_TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  // 만료 시에만 재요청 활성 — 누르면 새 코드 받고 타이머 리셋
  const onResend = () => {
    if (!phone) return;
    requestVerify(phone, {
      onSuccess: () => {
        setError(undefined);
        setCode('');
        countdown.reset();
      },
    });
  };

  const canResend = countdown.isExpired && !resending;
  const timerClass = countdown.isExpired ? 'text-danger' : 'text-text-soft';

  return (
    <ScreenContainer
      scrollable={false}
      header={<Header title="인증 코드 입력" showBack onBack={onBack} />}
    >
      <View className="flex-1 px-6 pt-6">
        {/* 진행 단계 2/2 */}
        <View className="flex-row gap-1 mb-6">
          <View className="flex-1 h-1 bg-primary rounded-full" />
          <View className="flex-1 h-1 bg-primary rounded-full" />
        </View>

        <Text className="text-2xl font-extrabold text-text leading-tight">
          코드 4자리를{'\n'}입력해주세요
        </Text>
        <Text className="text-sm text-text-soft mt-3 leading-relaxed">
          <Text className="font-semibold text-text">{phone ?? ''}</Text> 로 보낸
          {'\n'}4자리 코드를 입력해주세요
        </Text>

        <View className="mt-10">
          <VerificationCodeInput
            length={CODE_LENGTH}
            value={code}
            onChange={onChange}
            onComplete={onComplete}
            error={error}
          />
        </View>

        {/* 타이머 + 재요청 */}
        <View className="mt-8 flex-row items-center justify-between">
          <Text className="text-sm text-text-soft">
            남은 시간:{' '}
            <Text className={`font-bold ${timerClass}`}>{countdown.formatted}</Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={!canResend}
            onPress={onResend}
            hitSlop={8}
          >
            <Text
              className={`text-sm font-semibold underline ${canResend ? 'text-primary-bold' : 'text-text-mute'}`}
            >
              코드 재요청
            </Text>
          </Pressable>
        </View>

        {/* 데모 안내 인포 박스 */}
        <View className="mt-6 bg-warning-soft border border-warning rounded-md p-3">
          <Text className="text-xs text-text-soft leading-relaxed">
            <Text className="font-bold text-warning">💡 MVP 데모</Text>: 모든 0(영) 4개를
            입력하면 통과돼요.
          </Text>
        </View>

        {verifying && (
          <Text className="text-xs text-text-mute mt-4 text-center">확인 중...</Text>
        )}
      </View>

      {/* 인라인 토스트 — 성공 시 1.2초 노출 후 부모 홈으로 replace */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-success rounded-md px-4 py-3 shadow">
          <Text className="text-surface font-bold text-center">{toast}</Text>
        </View>
      )}
    </ScreenContainer>
  );
}
