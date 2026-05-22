import { useEffect, useRef } from 'react';
import type {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface VerificationCodeInputProps {
  length: 4 | 6;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  error?: string;
}

const SHAKE_STEP_MS = 100;

export function VerificationCodeInput({
  length,
  value,
  onChange,
  onComplete,
  error,
}: VerificationCodeInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const shake = useSharedValue(0);
  const hasError = Boolean(error);

  useEffect(() => {
    if (hasError) {
      shake.value = withSequence(
        withTiming(-8, { duration: SHAKE_STEP_MS }),
        withTiming(8, { duration: SHAKE_STEP_MS }),
        withTiming(-6, { duration: SHAKE_STEP_MS }),
        withTiming(6, { duration: SHAKE_STEP_MS }),
        withTiming(0, { duration: SHAKE_STEP_MS }),
      );
    }
  }, [hasError, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const setRef = (i: number) => (el: TextInput | null) => {
    inputs.current[i] = el;
  };

  const handleChangeText = (i: number) => (text: string) => {
    const digit = text.replace(/\D/g, '').slice(-1);

    if (digit === '') {
      onChange(value.slice(0, i));
      return;
    }

    const next = (value.slice(0, i) + digit).slice(0, length);
    onChange(next);

    if (next.length === length) {
      onComplete?.(next);
    } else if (i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyPress =
    (i: number) =>
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && !value[i] && i > 0) {
        inputs.current[i - 1]?.focus();
        onChange(value.slice(0, i - 1));
      }
    };

  const borderClass = hasError ? 'border-danger' : 'border-primary';

  return (
    <View>
      <Animated.View style={animatedStyle}>
        <View className="flex-row gap-3">
          {Array.from({ length }).map((_, i) => (
            <TextInput
              key={i}
              ref={setRef(i)}
              value={value[i] ?? ''}
              onChangeText={handleChangeText(i)}
              onKeyPress={handleKeyPress(i)}
              maxLength={1}
              keyboardType="number-pad"
              textAlign="center"
              className={`flex-1 h-20 bg-surface border-2 ${borderClass} rounded-md text-3xl font-extrabold text-text`}
            />
          ))}
        </View>
      </Animated.View>
      {hasError && (
        <Text className="text-xs font-semibold text-danger mt-2">{error}</Text>
      )}
    </View>
  );
}
