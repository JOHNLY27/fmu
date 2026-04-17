import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'mission';
  createdAt: any;
  read: boolean;
}

export default function NotificationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort locally to bypass Firebase composite index requirements
      docs.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
        return timeB - timeA;
      });

      setNotifications(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: COLORS.tertiary };
      case 'warning': return { name: 'alert-circle', color: COLORS.error };
      case 'mission': return { name: 'navigate', color: COLORS.primary };
      default: return { name: 'notifications', color: COLORS.onSurfaceVariant };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : (typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp.seconds * 1000));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signal Deck</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Syncing signals...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyCircle}>
              <Ionicons name="notifications-off-outline" size={40} color="rgba(0,0,0,0.1)" />
            </View>
            <Text style={styles.emptyTitle}>Clear Skies</Text>
            <Text style={styles.emptySub}>No mission alerts or system signals at this time.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((item) => {
              const icon = getIcon(item.type);
              return (
                <TouchableOpacity key={item.id} style={[styles.notiCard, !item.read && styles.unreadCard]}>
                   <View style={[styles.iconBox, { backgroundColor: `${icon.color}10` }]}>
                      <Ionicons name={icon.name as any} size={20} color={icon.color} />
                   </View>
                   <View style={{ flex: 1 }}>
                      <View style={styles.notiHeader}>
                        <Text style={styles.notiTitle}>{item.title}</Text>
                        <Text style={styles.notiTime}>{formatDate(item.createdAt)}</Text>
                      </View>
                      <Text style={styles.notiMsg} numberOfLines={2}>{item.message}</Text>
                   </View>
                   {!item.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.footer}>
           <Text style={styles.footerText}>Butuan City Operations • Mission Control</Text>
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
    flexGrow: 1,
  },
  list: {
    gap: 12,
  },
  notiCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    gap: 16,
    ...SHADOWS.sm,
    alignItems: 'center',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  notiTime: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
  },
  notiMsg: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '500',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.2)',
    letterSpacing: 1,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.3)',
    textAlign: 'center',
    maxWidth: '70%',
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.2)',
    letterSpacing: 2,
  },
});
