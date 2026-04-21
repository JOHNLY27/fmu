import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders, Order } from '../services/orderService';

export default function OrderHistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return COLORS.primary;
    }
  };

  const renderOrderItem = (order: Order) => (
    <TouchableOpacity 
      key={order.id} 
      style={styles.orderCard}
      onPress={() => navigation.navigate('TrackingDetail', { orderId: order.id })}
    >
      <View style={styles.orderIconBox}>
        <Ionicons 
          name={order.type === 'food' ? 'fast-food' : order.type === 'ride' ? 'car' : 'cube'} 
          size={24} 
          color={COLORS.onSurface} 
        />
      </View>
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderType}>{order.type.toUpperCase()}</Text>
          <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.orderLocation} numberOfLines={1}>{order.dropoffLocation}</Text>
        <Text style={styles.orderDate}>
          {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
        </Text>
      </View>
      <View style={styles.orderPriceBox}>
        <Text style={styles.orderPrice}>₱{order.price.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.1)" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{orders.length}</Text>
                <Text style={styles.summaryLabel}>TOTAL MISSIONS</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  ₱{orders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, order) => sum + Number(order.price || 0), 0)
                    .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
                <Text style={styles.summaryLabel}>TOTAL SPENT</Text>
            </View>

        </View>

        <Text style={styles.sectionTitle}>PAST ACTIVITIES</Text>
        
        {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
            <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={48} color="rgba(0,0,0,0.1)" />
                <Text style={styles.emptyText}>No orders recorded yet.</Text>
            </View>
        ) : (
            orders.map(renderOrderItem)
        )}
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
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  content: {
    padding: 24,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.onSurface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    letterSpacing: 1,
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 20,
    paddingLeft: 4,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  orderIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 10,
  },
  orderType: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  orderStatus: {
    fontSize: 8,
    fontWeight: '900',
  },
  orderLocation: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  orderDate: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  orderPriceBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.2)',
    fontWeight: '700',
  },
});
