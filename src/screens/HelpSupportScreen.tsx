import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function HelpSupportScreen({ navigation }: any) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { 
      q: "How are Pabili mission fees calculated?", 
      a: "Our standard concierge fee starts at ₱49. This covers our rider's scouting time and fuel within the city limits. Heavy loads may incur tiny additional charges."
    },
    { 
      q: "Can I track my mission in real-time?", 
      a: "Yes! Every active mission provides a 'Live Telemetry' feed where you can see your runner's exact status and estimated arrival."
    },
    { 
      q: "What if an item I requested is out of stock?", 
      a: "Our riders are trained to call or chat with you immediately for substitutions. Mission execution remains paused until you confirm the change."
    },
    { 
      q: "Which areas in Butuan do you cover?", 
      a: "We currently cover nearly all 86 barangays in Butuan City, from the city center to the surrounding developmental zones."
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DIRECT DISPATCH</Text>
          <View style={styles.supportGrid}>
             <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('tel:09000000000')}>
                <View style={[styles.iconBox, { backgroundColor: `${COLORS.primary}10` }]}>
                   <Ionicons name="call" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>Call Center</Text>
                <Text style={styles.cardSub}>24/7 Agent Help</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.supportCard} onPress={() => navigation.navigate('Chat', { orderId: 'support' })}>
                <View style={[styles.iconBox, { backgroundColor: `${COLORS.tertiary}10` }]}>
                   <Ionicons name="chatbubbles" size={24} color={COLORS.tertiary} />
                </View>
                <Text style={styles.cardTitle}>Live Chat</Text>
                <Text style={styles.cardSub}>Direct Dispatch</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MISSION INTELLIGENCE (FAQ)</Text>
          <View style={styles.faqList}>
             {faqs.map((f, i) => (
                <TouchableOpacity key={i} style={styles.faqItem} onPress={() => setActiveFaq(activeFaq === i ? null : i)}>
                   <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{f.q}</Text>
                      <Ionicons name={activeFaq === i ? "chevron-up" : "chevron-down"} size={16} color="rgba(0,0,0,0.2)" />
                   </View>
                   {activeFaq === i && (
                     <Text style={styles.faqAnswer}>{f.a}</Text>
                   )}
                </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerText}>FetchMeUp Support Team • Butuan City</Text>
           <Text style={styles.versionText}>V 4.2.0 (Stable)</Text>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
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
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  cardSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 2,
  },
  faqList: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
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
  faqAnswer: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(0,0,0,0.45)',
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.25)',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.15)',
    marginTop: 4,
    fontWeight: '700',
  },
});
