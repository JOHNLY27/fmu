import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HelpSupportScreen({ navigation }: any) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const faqs = [
    { 
      q: "How are Pabili mission fees calculated?", 
      a: "Our standard concierge fee starts at ₱49. This covers our rider's scouting time and fuel within city limits. Bulk orders or extreme distances may incur a dynamic surcharge which is always visible before you confirm."
    },
    { 
      q: "Can I track my mission in real-time?", 
      a: "Absolutely. Every active mission features a 'Live Telemetry' feed. You can see your runner's exact GPS location and high-accuracy Estimated Time of Arrival (ETA) updated every 3 seconds."
    },
    { 
      q: "What if an item is out of stock?", 
      a: "Your Fetch Runner will immediately initiate a 'Substitution Protocol' via live chat. Mission execution pauses until you approve a replacement or choose to remove the item."
    },
    { 
      q: "Is FetchMeUp available 24/7?", 
      a: "We operate from 6:00 AM to 11:00 PM daily to ensure the safety of our mission runners. Schedule a 'Priority Dispatch' in the morning for early morning requirements."
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1419" />
      
      {/* Immersive Header */}
      <LinearGradient colors={['#0f1419', '#1c242c']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Intelligence Hub</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.headerContent}>
           <View style={styles.supportIconBg}>
              <Ionicons name="headset" size={32} color={COLORS.primary} />
           </View>
           <Text style={styles.heroText}>How can we assist your mission?</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Quick Connect Grid */}
          <Text style={styles.sectionLabel}>DIRECT DISPATCH</Text>
          <View style={styles.supportGrid}>
             <TouchableOpacity 
               style={styles.supportCard} 
               onPress={() => Linking.openURL('tel:09000000000')}
             >
                <LinearGradient colors={[`${COLORS.primary}15`, 'transparent']} style={styles.cardGlow} />
                <View style={[styles.iconBox, { backgroundColor: `${COLORS.primary}10` }]}>
                   <Ionicons name="call" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>Call Center</Text>
                <Text style={styles.cardSub}>24/7 Priority Voice</Text>
             </TouchableOpacity>

             <TouchableOpacity 
               style={styles.supportCard} 
               onPress={() => navigation.navigate('Chat', { orderId: 'support' })}
             >
                <LinearGradient colors={[`${COLORS.tertiary}15`, 'transparent']} style={styles.cardGlow} />
                <View style={[styles.iconBox, { backgroundColor: `${COLORS.tertiary}10` }]}>
                   <Ionicons name="chatbubbles" size={24} color={COLORS.tertiary} />
                </View>
                <Text style={styles.cardTitle}>Live Agent</Text>
                <Text style={styles.cardSub}>Real-time Texting</Text>
             </TouchableOpacity>
          </View>

          {/* FAQ Accordion */}
          <Text style={[styles.sectionLabel, { marginTop: 32 }]}>MISSION INTELLIGENCE (FAQ)</Text>
          <View style={styles.faqList}>
             {faqs.map((f, i) => (
                <TouchableOpacity 
                  key={i} 
                  activeOpacity={0.7}
                  style={[styles.faqItem, activeFaq === i && styles.faqActive]} 
                  onPress={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                   <View style={styles.faqHeader}>
                      <Text style={[styles.faqQuestion, activeFaq === i && styles.faqActiveText]}>{f.q}</Text>
                      <View style={[styles.chevronBox, activeFaq === i && styles.chevronActive]}>
                        <Ionicons name={activeFaq === i ? "chevron-up" : "chevron-down"} size={14} color={activeFaq === i ? COLORS.white : 'rgba(0,0,0,0.3)'} />
                      </View>
                   </View>
                   {activeFaq === i && (
                     <View style={styles.answerBox}>
                        <Text style={styles.faqAnswer}>{f.a}</Text>
                     </View>
                   )}
                </TouchableOpacity>
             ))}
          </View>

          {/* Social / Legal Links */}
          <View style={styles.extraLinks}>
             <TouchableOpacity style={styles.linkRow}>
                <Ionicons name="document-text-outline" size={20} color="rgba(0,0,0,0.5)" />
                <Text style={styles.linkText}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.2)" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.linkRow}>
                <Ionicons name="shield-outline" size={20} color="rgba(0,0,0,0.5)" />
                <Text style={styles.linkText}>Privacy Protocol</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.2)" />
             </TouchableOpacity>
          </View>

          <View style={styles.footer}>
             <Ionicons name="location-outline" size={14} color="rgba(0,0,0,0.3)" />
             <Text style={styles.footerText}>Butuan HQ • J.C. Aquino Avenue, 8600</Text>
             <Text style={styles.versionText}>FETCHMEUP v5.0.0 (BETA)</Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerContent: {
    marginTop: 32,
    alignItems: 'center',
  },
  supportIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 16,
    paddingLeft: 4,
  },
  supportGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  supportCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  cardSub: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '700',
    marginTop: 4,
  },
  faqList: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  faqActive: {
    backgroundColor: '#fff',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
    paddingRight: 16,
  },
  faqActiveText: {
    color: COLORS.primary,
  },
  chevronBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronActive: {
    backgroundColor: COLORS.primary,
  },
  answerBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  faqAnswer: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 22,
    fontWeight: '600',
  },
  extraLinks: {
    marginTop: 32,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    ...SHADOWS.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    gap: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '800',
    marginTop: 8,
  },
  versionText: {
    fontSize: 8,
    color: 'rgba(0,0,0,0.15)',
    marginTop: 6,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
