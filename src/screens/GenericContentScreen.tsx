import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const contentMap: any = {
  'Help Center': {
    icon: 'chatbubbles-outline',
    title: 'How can we help?',
    body: "1. How to place an order?\nSimply go to the Home screen, select either 'Food Delivery', 'Ride', or 'Pabili', and follow the on-screen prompts.\n\n2. I need to report an issue.\nPlease email us at support@fetchmeup.ph or call our Butuan City hotline at (085) 123-4567.\n\n3. Can I cancel an order?\nYou may cancel your order before a rider accepts it via the Tracking tab.\n\n4. How long does delivery take?\nMost deliveries in Butuan City take 15-30 minutes depending on your location and traffic conditions.\n\n5. What areas do you serve?\nWe currently serve all barangays within Butuan City including Libertad, Doongan, Ampayon, Bancasi, and more."
  },
  'Terms of Service': {
    icon: 'document-text-outline',
    title: 'Terms of Service',
    body: "By using FetchMeUp, you agree to abide by local laws and regulations within Butuan City and the Philippines.\n\n1. User Responsibilities\nYou are responsible for providing correct addresses and ensuring the items requested in the 'Pabili' service do not violate any local laws.\n\n2. Liability\nFetchMeUp connects riders with users. We hold zero liability for damage of goods during transit beyond our standard insurance policy.\n\n3. Account Termination\nWe reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.\n\n4. Service Availability\nFetchMeUp services are available from 6:00 AM to 11:00 PM daily in Butuan City."
  },
  'Privacy Policy': {
    icon: 'shield-outline',
    title: 'Privacy Policy',
    body: "Your privacy is fundamentally important to us.\n\n• Location Data: We track your location only to connect you with nearby riders and merchants.\n• Payment Data: Payments are processed securely via third-party providers. We do not store raw credit card information on our servers.\n• Erasure requests: You may contact support at any time to explicitly delete your account.\n• Data Retention: We retain order history for 1 year for dispute resolution purposes.\n• Third Parties: We do not sell your personal data to any third party."
  },
  'Notification Preferences': {
    icon: 'notifications-outline',
    title: 'Push & Alerts',
    body: "Push Notifications: [ON]\nSMS Alerts: [ON]\nEmail Promos: [OFF]\n\nAs a Rider, you will receive a notification every time a new job (Pabili/Delivery) is requested in your current zone (Butuan City).\n\nAs a Customer, you'll be notified when:\n• Your order is accepted by a rider\n• Your rider is on the way\n• Your order has been delivered"
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
  },
  'Forgot Password': {
    icon: 'key-outline',
    title: 'Reset Your Password',
    body: "To reset your password:\n\n1. Go back to the login screen\n2. Enter the email address associated with your account\n3. Check your email inbox for a password reset link\n4. Click the link and create a new password\n\nIf you don't receive the email within 5 minutes, check your spam folder or contact support at support@fetchmeup.ph.\n\nNote: Password reset links expire after 24 hours."
  },
  'Google Login': {
    icon: 'logo-google',
    title: 'Google Sign-In',
    body: "Google Sign-In is coming soon!\n\nWe're currently integrating Google OAuth 2.0 for a seamless login experience. In the meantime, please use your email and password to sign in.\n\nBenefits of Google Sign-In:\n• One-tap login\n• No password to remember\n• Secure authentication by Google"
  },
  'Facebook Login': {
    icon: 'logo-facebook',
    title: 'Facebook Sign-In',
    body: "Facebook Sign-In is coming soon!\n\nWe're working on integrating Facebook Login for easy access. Stay tuned for updates!\n\nBenefits of Facebook Sign-In:\n• Quick login with your Facebook account\n• No separate password needed\n• Sync your profile picture"
  },
  'Saved Stores': {
    icon: 'heart-outline',
    title: 'Your Saved Stores',
    body: "You haven't saved any stores yet!\n\nBrowse our Store Directory and tap the heart icon on any store to save it for quick access later.\n\nYour saved stores will appear here so you can:\n• Quickly reorder from your favorites\n• Get updates on store promos\n• See store hours at a glance\n\nPopular stores in Butuan:\n🍽️ Lachi's Sans Rival\n🍗 Jollibee - Butuan Langihan\n🔥 Penong's BBQ\n☕ Bo's Coffee - Butuan"
  },
  'Payment Methods': {
    icon: 'card-outline',
    title: 'Payment Options',
    body: "Available Payment Methods:\n\n💵 Cash on Delivery (COD)\nPay your rider directly upon delivery. This is the default payment method.\n\n📱 GCash (Coming Soon)\nPay seamlessly using your GCash wallet.\n\n💳 Credit/Debit Card (Coming Soon)\nSecure card payments via our payment processor.\n\n🏦 Bank Transfer (Coming Soon)\nDirect bank-to-bank transfers for larger orders.\n\nAll digital payment methods will be available in the next app update!"
  },
  'Promos & Vouchers': {
    icon: 'gift-outline',
    title: 'Your Promos & Vouchers',
    body: "🎉 Welcome Promo!\nUse code FETCHME50 to get ₱50 off your first order!\n\n🏍️ Free Delivery Weekend\nEvery Saturday, enjoy FREE delivery on all food orders within Butuan City.\n\n☕ Coffee Lovers Deal\nGet 20% off on all orders from partner cafés (Bo's Coffee, Cafe Caliente).\n\n📦 Pabili Discount\nFirst-time Pabili users get ₱30 off their service fee!\n\nTo apply a promo code:\n1. Place your order\n2. Before checkout, tap 'Apply Promo'\n3. Enter your code and enjoy the discount!"
  },
  'Receipt': {
    icon: 'receipt-outline',
    title: 'Order Receipt',
    body: "Your digital receipt will be available here after your order is completed.\n\nReceipt details include:\n• Order ID and date\n• Items ordered with prices\n• Delivery fee breakdown\n• Total amount paid\n• Rider name and delivery time\n\nYou can also find all your past receipts in the Activity tab under Order History."
  },
  'Call Customer': {
    icon: 'call-outline',
    title: 'Contact Customer',
    body: "To protect privacy, we use masked phone numbers.\n\nWhen you tap 'Call Customer':\n1. Our system connects you through a secure relay\n2. Neither party sees the other's real phone number\n3. Calls are limited to the duration of the active delivery\n\nIf you're having trouble reaching the customer:\n• Try calling again after 30 seconds\n• Send a chat message as an alternative\n• Contact support if the customer is unreachable"
  },
  'View all': {
    icon: 'grid-outline',
    title: 'All Available Options',
    body: "This feature is being expanded!\n\nSoon you'll be able to browse all available:\n• 🍽️ Food delivery restaurants (24+ stores)\n• 🚗 Ride options and fare estimates\n• 📦 Parcel delivery services\n• 🛍️ Pabili partner stores\n\nAll services are available within Butuan City, Agusan del Norte."
  },
};

export default function GenericContentScreen({ navigation, route }: any) {
  const { title } = route.params || { title: 'Page' };
  
  const content = contentMap[title] || {
    icon: 'construct-outline',
    title: title || 'Coming Soon',
    body: `The ${title} feature is currently being finalized and will be available in the next app update!\n\nStay tuned for:\n• Full functionality\n• Real-time updates\n• Enhanced user experience\n\nThank you for your patience! 🚀`
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
          <View style={styles.iconBg}>
            <Ionicons name={content.icon} size={40} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <View style={styles.bodyCard}>
          <Text style={styles.desc}>{content.body}</Text>
        </View>
        
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
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
    paddingTop: 30,
    paddingBottom: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  bodyCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}15`,
    ...SHADOWS.sm,
    marginBottom: 30,
  },
  desc: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    lineHeight: 26,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.md,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
