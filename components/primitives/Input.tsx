import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import tokens from '@/design-tokens.json';

export type InputVariant = 'text' | 'number' | 'tel' | 'search';

export interface InputProps extends Omit<TextInputProps, 'style' | 'onFocus' | 'onBlur'> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  prefix?: string;
}

const keyboardByVariant: Record<InputVariant, TextInputProps['keyboardType']> = {
  text: 'default',
  number: 'numeric',
  tel: 'phone-pad',
  search: 'default',
};

const placeholderColor = tokens.color.neutral['text-mute'].value;

export function Input({
  variant = 'text',
  label,
  error,
  prefix,
  ...inputProps
}: InputProps) {
  // 포커스 시 별도 강조 색 적용 안 함 — 사용자 의도 (살구 테두리 제거).
  // web의 native focus outline은 outline-none + style fallback으로 차단.
  const borderClass = error ? 'border-danger' : 'border-border bg-surface';

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm text-text-soft mb-2 font-medium">{label}</Text>
      )}

      <View
        className={`flex-row items-center rounded-md border px-4 py-3 ${borderClass}`}
      >
        {prefix && (
          <Text className="text-base text-text-mute mr-2">{prefix}</Text>
        )}

        <TextInput
          keyboardType={keyboardByVariant[variant]}
          placeholderTextColor={placeholderColor}
          className="flex-1 text-base text-text"
          // RN Web에서 <input>이 받는 브라우저 기본 :focus outline 제거.
          // RN 자체엔 outlineStyle 키가 없지만 RN-Web이 string 그대로 DOM에 전달.
          style={{ outlineStyle: 'none' } as never}
          {...inputProps}
        />
      </View>

      {error && (
        <Text className="text-xs text-danger mt-1">{error}</Text>
      )}
    </View>
  );
}
