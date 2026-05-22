import { useState } from 'react';
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
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-primary bg-primary-50'
      : 'border-border bg-surface';

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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
      </View>

      {error && (
        <Text className="text-xs text-danger mt-1">{error}</Text>
      )}
    </View>
  );
}
