import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  error?: string;
}

export default function Input({ label, icon, containerStyle, error, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? { paddingLeft: 44 } : { paddingLeft: 16 },
            style,
          ]}
          placeholderTextColor={`${COLORS.onSurfaceVariant}60`}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  iconContainer: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  input: {
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: '500',
  },
});
