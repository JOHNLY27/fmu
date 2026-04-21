import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface IntroScreenProps {
  onFinish: () => void;
}

export default function IntroScreen({ onFinish }: IntroScreenProps) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Phase 1: Logo Entry
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    logoScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.5)) });

    // Phase 2: Slogan Entry
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 800 });
    }, 800);

    // Phase 3: Pulse Animation (Subtle breathing)
    setTimeout(() => {
      logoScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        true
      );
    }, 1500);

    // Phase 4: Exit Sequence
    setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 800 }, (isFinished) => {
        if (isFinished) {
          runOnJS(onFinish)();
        }
      });
    }, 3500); // Intro lasts ~3.5 seconds total
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withTiming(textOpacity.value ? 0 : 20) }]
  }));

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      <LinearGradient
        colors={['#fff4ef', '#ffe8dc', '#ffdfcc']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.brandingContainer}>
        <Animated.Image 
          source={require('../../assets/icon.png')}
          style={[styles.logo, animatedLogoStyle]}
          resizeMode="contain"
        />
        
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Animated.Text style={styles.appName}>FETCHMEUP</Animated.Text>
          <Animated.Text style={styles.tagline}>Your City, Delivered • Butuan HQ</Animated.Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.loaderBar}>
          <Animated.View style={[styles.loaderProgress]} />
        </View>
        <Animated.Text style={styles.versionText}>INTELLIGENT LOGISTICS v1.0.4</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: 20,
    shadowColor: "#9b3f00",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#9b3f00',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9b3f00',
    marginTop: 8,
    letterSpacing: 2,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  loaderBar: {
    width: width * 0.4,
    height: 3,
    backgroundColor: 'rgba(155, 63, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loaderProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#9b3f00',
    opacity: 0.4,
  },
  versionText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9b3f00',
    letterSpacing: 1,
    opacity: 0.3,
  }
});
