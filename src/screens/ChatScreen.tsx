import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, subscribeToMessages, sendMessage } from '../services/chatService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const quickReplies = ['Okay, thanks!', 'Be right there', 'Call me when here'];

export default function ChatScreen({ navigation, route }: any) {
  const { orderId } = route?.params || {};
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partnerName, setPartnerName] = useState('Connecting...');

  useEffect(() => {
    if (!orderId || !user) return;

    // Dynamically fetch who we are talking to
    const fetchPartnerName = async () => {
      try {
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          // If you are the customer, lookup the rider. If you are the rider, lookup customer.
          const targetId = user.uid === orderData.userId ? orderData.riderId : orderData.userId;
          
          if (targetId) {
            const userSnap = await getDoc(doc(db, 'users', targetId));
            if (userSnap.exists()) {
              setPartnerName(userSnap.data().name || 'FetchMeUp User');
            } else {
              setPartnerName(user.uid === orderData.userId ? 'Rider' : 'Customer');
            }
          } else {
            setPartnerName('Finding Rider...');
          }
        }
      } catch (e) {
        console.log('Error fetching partner:', e);
      }
    };
    fetchPartnerName();

    const unsubscribe = subscribeToMessages(orderId, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [orderId, user]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !user) return;
    if (!orderId) {
      Alert.alert('Missing Order ID', 'You need to book a ride or have an active delivery to chat!');
      return;
    }
    try {
      await sendMessage(orderId, user.uid, text.trim());
      setMessage('');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Chat Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.riderInfoRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.riderName}>{partnerName}</Text>
              <Text style={styles.riderStatus}>ACTIVE CHAT</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Label */}
        <View style={styles.dayLabel}>
          <Text style={styles.dayLabelText}>LIVE CHAT</Text>
        </View>

        {messages.length === 0 && (
          <Text style={{ textAlign: 'center', color: COLORS.onSurfaceVariant, fontSize: 13, marginTop: 20 }}>
            Send a message to start chatting!
          </Text>
        )}

        {messages.map((msg, idx) => {
          const isOutgoing = msg.senderId === user?.uid;
          return (
            <View key={msg.id || idx} style={[styles.messageRow, isOutgoing ? styles.outgoingRow : null]}>
              <View style={isOutgoing ? styles.outgoingBubble : styles.incomingBubble}>
                <Text style={isOutgoing ? styles.outgoingText : styles.incomingText}>
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Quick Replies */}
        <View style={styles.quickReplies}>
          {quickReplies.map((reply) => (
            <TouchableOpacity 
              key={reply} 
              style={styles.quickReplyChip}
              onPress={() => handleSend(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.inputActionBtn}>
            <Ionicons name="add-circle" size={26} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputActionBtn}>
            <Ionicons name="camera" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(message)}>
          <Ionicons name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: `${COLORS.surface}CC`,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 8,
    borderRadius: RADIUS.full,
  },
  riderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.tertiary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  riderStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 20,
  },
  dayLabel: {
    alignSelf: 'center',
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xxl,
  },
  dayLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
  },
  messageRow: {
    marginBottom: SPACING.lg,
    maxWidth: '85%',
  },
  outgoingRow: {
    alignSelf: 'flex-end',
  },
  incomingBubble: {
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.lg,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  outgoingBubble: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: 4,
    ...SHADOWS.md,
  },
  incomingText: {
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  outgoingText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
  messageImage: {
    width: '100%',
    height: 160,
    borderRadius: RADIUS.md,
  },
  timestamp: {
    fontSize: 9,
    fontWeight: '500',
    color: `${COLORS.onSurfaceVariant}80`,
    marginTop: 4,
    marginLeft: 4,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    justifyContent: 'flex-end',
    paddingRight: 4,
  },
  seenText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.lg,
    paddingVertical: 8,
  },
  quickReplyChip: {
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
    backgroundColor: `${COLORS.surface}EE`,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  inputActionBtn: {
    padding: 4,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 14,
    color: COLORS.onSurface,
    minHeight: 24,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
});
