import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const contentMap: any = {
  'Help Center': {
    icon: 'chatbubbles-outline',
    title: 'How can we help?',
    body: "1. How to place an order?\nSimply go to the Home screen, select either 'Food Delivery', 'Ride', or 'Pabili', and follow the on-screen prompts.\n\n2. I need to report an issue.\nPlease email us at support@fetchmeup.ph or call our Butuan City hotline at (085) 123-4567.\n\n3. Can I cancel an order?\nYou may cancel your order before a rider accepts it via the Tracking tab."
  },
  'Terms of Service': {
    icon: 'document-text-outline',
    title: 'Terms of Service',
    body: "By using FetchMeUp, you agree to abide by local laws and regulations within Butuan City and the Philippines.\n\n1. User Responsibilities\nYou are responsible for providing correct addresses and ensuring the items requested in the 'Pabili' service do not violate any local laws.\n\n2. Liability\nFetchMeUp connects riders with users. We hold zero liability for damage of goods during transit beyond our standard insurance policy."
  },
  'Privacy Policy': {
    icon: 'shield-outline',
    title: 'Privacy Policy',
    body: "Your privacy is fundamentally important to us.\n\n• Location Data: We track your location only to connect you with nearby riders and merchants.\n• Payment Data: Payments are processed securely via third-party providers. We do not store raw credit card information on our servers.\n• Erasure requests: You may contact support at any time to explicitly delete your account."
  },
  'Notification Preferences': {
    icon: 'notifications-outline',
    title: 'Push & Alerts',
    body: "Push Notifications: [ON]\nSMS Alerts: [ON]\nEmail Promos: [OFF]\n\nAs a Rider, you will receive a notification every time a new job (Pabili/Delivery) is requested in your current zone (Butuan City)."
  },
  'Navigation Tools': {
    icon: 'map-outline',
    title: 'Routing App',
    body: "Default Navigation App: \n• Google Maps (Selected)\n• Waze\n\nTurn-by-turn navigation will automatically open using your selected preferred application every time you accept a new delivery job."
  },
  'Privacy & Security': {
    icon: 'lock-closed-outline',
    title: 'Account Security',
    body: "• Two-Factor Authentication (2FA) is turned OFF.\n• Your Rider ID check is fully Verified.\n\nTo request data erasure or change your active Government ID on file, please visit the FetchMeUp Hub in Butuan."
  }
};

export default function GenericContentScreen({ navigation, route }: any) {
  const { title } = route.params || { title: 'Page' };
  
  const content = contentMap[title] || {
    icon: 'construct-outline',
    title: 'Under Construction',
    body: `The ${title} screen is currently being built and will automatically activate in the next app update!`
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={content.icon} size={60} color={`${COLORS.primary}80`} />
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.desc}>{content.body}</Text>
        
        {content.title === 'Under Construction' && (
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.outlineVariant}20`,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLow,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: 40,
    paddingBottom: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 20,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    lineHeight: 26,
    marginBottom: 40,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
