import React, { useState } from 'react';
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
  variant?: 'default' | 'filled' | 'outline';
}

export default function Input({ label, icon, containerStyle, error, style, variant = 'default', ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getVariantStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.inputOutline;
      case 'filled':
        return styles.inputFilled;
      default:
        return styles.inputDefault;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper, 
        getVariantStyle(),
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? { paddingLeft: 44 } : { paddingLeft: 16 },
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    transition: 'all 0.2s ease-in-out',
  },
  inputDefault: {
    backgroundColor: COLORS.surfaceLow,
  },
  inputFilled: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    position: 'absolute',
    left: 14,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  input: {
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: '500',
  },
});
