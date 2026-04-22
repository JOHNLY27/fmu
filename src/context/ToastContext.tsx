import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextData {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [toastData, setToastData] = useState<ToastOptions | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    setVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToastData(options);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, options.duration || 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && toastData && (
        <ToastComponent data={toastData} onHide={hideToast} />
      )}
    </ToastContext.Provider>
  );
}

// Separate component to handle its own styles/animations
import { Animated, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

function ToastComponent({ data, onHide }: { data: ToastOptions; onHide: () => void }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: insets.top + 10,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    return () => {
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };
  }, [insets.top, slideAnim]);

  const getIcon = () => {
    switch (data.type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (data.type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return COLORS.primary;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={onHide}
        style={styles.toastContent}
      >
        <View style={[styles.iconBox, { backgroundColor: `${getColor()}20` }]}>
          <Ionicons name={getIcon() as any} size={20} color={getColor()} />
        </View>
        <View style={styles.textBox}>
          {data.title && <Text style={styles.toastTitle}>{data.title.toUpperCase()}</Text>}
          <Text style={styles.toastMessage}>{data.message}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  toastContent: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 450,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textBox: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
});
