import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { Header, ScreenContainer } from '@/components';
import { Button, Input } from '@/components/primitives';
import { useRequestVerify } from '@/hooks';
import { formatPhone } from '@/utils/formatPhone';

const PhoneSchema = z.object({
  phone: z.string().regex(/^010-?\d{4}-?\d{4}$/, '올바른 휴대폰 번호 형식'),
});
type PhoneForm = z.infer<typeof PhoneSchema>;

// 부모 등록 1단계 — 휴대폰 번호 입력 → 인증 코드 요청
export default function AddParentPhone() {
  const { control, handleSubmit, formState } = useForm<PhoneForm>({
    resolver: zodResolver(PhoneSchema),
    mode: 'onChange',
    defaultValues: { phone: '' },
  });

  const { mutateAsync: requestVerify, isPending } = useRequestVerify();

  const onSubmit = async ({ phone }: PhoneForm) => {
    await requestVerify(phone);
    router.push({
      pathname: '/(caregiver)/add-parent/verify',
      params: { phone },
    });
  };

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(caregiver)/parents');
  };

  return (
    <ScreenContainer
      scrollable={false}
      header={<Header title="부모님 등록하기" showBack onBack={onBack} />}
    >
      <View className="flex-1 px-6 pt-6">
        {/* 진행 단계 1/2 */}
        <View className="flex-row gap-1 mb-6">
          <View className="flex-1 h-1 bg-primary rounded-full" />
          <View className="flex-1 h-1 bg-border rounded-full" />
        </View>

        <Text className="text-2xl font-extrabold text-text leading-tight">
          부모님 휴대폰{'\n'}번호로 인증해주세요
        </Text>
        <Text className="text-sm text-text-soft mt-3 leading-relaxed">
          부모님께 인증 코드를 보내드려요.{'\n'}코드를 자녀 분이 입력하면 등록 완료!
        </Text>

        <View className="mt-8">
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Input
                variant="tel"
                label="부모님 휴대폰 번호"
                prefix="🇰🇷 +82"
                placeholder="010-0000-0000"
                value={value}
                onChangeText={(text) => onChange(formatPhone(text))}
                maxLength={13}
                error={error?.message}
              />
            )}
          />
          <Text className="text-xs text-text-mute mt-2">
            ‒ 없이 숫자만 입력하세요
          </Text>
        </View>

        {/* 데모 안내 인포 박스 */}
        <View className="mt-6 bg-info-soft border border-info rounded-md p-4">
          <Text className="text-xs text-text-soft leading-relaxed">
            <Text className="text-info">ℹ️ </Text>
            데모 모드에선 실제 SMS는 발송되지 않아요. 다음 화면에서{' '}
            <Text className="font-bold text-text">0000</Text>을 입력해 진행하세요.
          </Text>
        </View>
      </View>

      <View className="px-5 pb-8">
        <Button
          label="인증 코드 요청 ▶"
          size="lg"
          loading={isPending}
          disabled={!formState.isValid}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenContainer>
  );
}
