import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function RiderReviewsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'ratings'),
      where('targetId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      // In-memory sort to avoid index requirements
      const sorted = data.sort((a, b) => 
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setReviews(sorted);
      setLoading(false);
    });


    return () => unsubscribe();
  }, [user]);

  const renderReview = ({ item }: any) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons 
              key={star}
              name={star <= item.rating ? "star" : "star-outline"} 
              size={14} 
              color={star <= item.rating ? "#FFB300" : "#E9ECEF"} 
            />
          ))}
        </View>
        <Text style={styles.reviewDate}>
          {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
        </Text>
      </View>
      <Text style={styles.reviewComment}>
        {item.comment || "The customer didn't leave a text review, but mission was successful."}
      </Text>
      <View style={styles.orderLabelBox}>
         <Text style={styles.orderLabel}>MISSION ID: {item.orderId?.substring(0,8).toUpperCase()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mission Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching your performance intel...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
             <Ionicons name="star-outline" size={60} color="rgba(0,0,0,0.1)" />
          </View>
          <Text style={styles.emptyTitle}>NO FEEDBACK YET</Text>
          <Text style={styles.emptySub}>Complete more missions to start receiving intel from customers.</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  backBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '700',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurface,
    fontWeight: '500',
    marginBottom: 16,
  },
  orderLabelBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 0.5,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  emptySub: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    lineHeight: 20,
    fontWeight: '500',
  }
});
