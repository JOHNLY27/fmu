import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, FONTS, SHADOWS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const sizeStyles: Record<string, { paddingH: number; paddingV: number; fontSize: number }> = {
    sm: { paddingH: 16, paddingV: 10, fontSize: 11 },
    md: { paddingH: 24, paddingV: 14, fontSize: 14 },
    lg: { paddingH: 32, paddingV: 18, fontSize: 16 },
    xl: { paddingH: 40, paddingV: 20, fontSize: 18 },
  };

  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            {
              paddingHorizontal: s.paddingH,
              paddingVertical: s.paddingV,
              opacity: isDisabled ? 0.5 : 1,
            },
            SHADOWS.md,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={[styles.text, { fontSize: s.fontSize, color: COLORS.white }, textStyle]}>
                {title}
              </Text>
              {icon}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, { bg: string; border?: string; textColor: string }> = {
    secondary: {
      bg: COLORS.secondaryContainer,
      textColor: COLORS.secondary,
    },
    outline: {
      bg: 'transparent',
      border: COLORS.outlineVariant,
      textColor: COLORS.onSurface,
    },
    ghost: {
      bg: 'transparent',
      textColor: COLORS.onSurfaceVariant,
    },
  };

  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          opacity: isDisabled ? 0.5 : 1,
          borderWidth: v.border ? 2 : 0,
          borderColor: v.border,
        },
        fullWidth && { width: '100%' },
        SHADOWS.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <>
          <Text style={[styles.text, { fontSize: s.fontSize, color: v.textColor }, textStyle]}>
            {title}
          </Text>
          {icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
