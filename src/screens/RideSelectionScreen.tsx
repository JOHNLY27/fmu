import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import BarangaySelector from '../components/ui/BarangaySelector';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';

const { width } = Dimensions.get('window');

const rideOptions = [
  {
    id: '1',
    name: 'Motorbike',
    desc: 'Fast & Agile',
    price: '₱85.00',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=150&fit=crop',
    selected: false,
  },
  {
    id: '2',
    name: 'Sedan Comfort',
    desc: 'Up to 4 people',
    price: '₱140.00',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=150&fit=crop',
    selected: true,
    recommended: true,
  },
  {
    id: '3',
    name: 'Courier XL',
    desc: 'Large parcels',
    price: '₱220.00',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=200&h=150&fit=crop',
    selected: false,
  },
];

export default function RideSelectionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeRide, setActiveRide] = React.useState(rideOptions[1]); // default Sedan
  const [isBooking, setIsBooking] = React.useState(false);
  const [pickup, setPickup] = React.useState('');
  const [dropoff, setDropoff] = React.useState('');

  const handleBooking = async () => {
    if (!user) return;
    if (!pickup || !dropoff) {
      alert("Please select both Pickup and Dropoff barangays.");
      return;
    }
    setIsBooking(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        type: 'ride',
        pickupLocation: `${pickup}, Butuan City`,
        dropoffLocation: `${dropoff}, Butuan City`,
        price: parseFloat(activeRide.price.replace('$', '')),
        itemDetails: activeRide.name,
        customerCity: user.location?.city || '',
        customerProvince: user.location?.province || '',
      });
      setIsBooking(false);
      // TrackingDetail is the Stack screen, which maps to TrackingScreen
      navigation.navigate('TrackingDetail', { orderId });
    } catch (e) {
      console.log(e);
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.mapImage}
          initialRegion={{
            latitude: 8.9475,
            longitude: 125.5406,
            latitudeDelta: 0.0422,
            longitudeDelta: 0.0221,
          }}
        >
          <Marker
            coordinate={{ latitude: 8.9475, longitude: 125.5406 }}
            title={pickup || 'Pickup Location'}
            description="Waiting for Rider"
          />
        </MapView>

        {/* Back Button Overlay */}
        <TouchableOpacity
          style={styles.floatingBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Content Panel */}
      <ScrollView
        style={styles.panel}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.panelContent}
      >
        {/* Location Inputs */}
        <View style={styles.locationCard}>
          <View style={styles.locationDots}>
            <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
            <View style={styles.dotLine} />
            <View style={[styles.dotSquare, { backgroundColor: COLORS.primary }]} />
          </View>
          <View style={styles.locationInputs}>
            <View style={{ marginBottom: 12 }}>
              <BarangaySelector
                label="PICKUP LOCATION"
                value={pickup}
                onSelect={setPickup}
                placeholder="Select Pickup Barangay"
                icon="navigate"
              />
            </View>
            <View>
              <BarangaySelector
                label="DROP-OFF LOCATION"
                value={dropoff}
                onSelect={setDropoff}
                placeholder="Where to?"
                icon="search"
              />
            </View>
          </View>
        </View>

        {/* Select Ride */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Select Ride</Text>
            <Text style={styles.sectionSubtitle}>Estimated arrival in 4-8 mins</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rideScroll}
        >
          {rideOptions.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={[
                styles.rideCard,
                activeRide.id === ride.id && styles.rideCardSelected,
              ]}
              activeOpacity={0.85}
              onPress={() => setActiveRide(ride)}
            >
              {ride.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              )}
              <Image
                source={{ uri: ride.image }}
                style={styles.rideImage}
                resizeMode="cover"
              />
              <Text style={styles.rideName}>{ride.name}</Text>
              <Text style={styles.rideDesc}>{ride.desc}</Text>
              <View style={styles.rideFooter}>
                <Text style={styles.ridePrice}>{ride.price}</Text>
                {activeRide.id === ride.id ? (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  </View>
                ) : (
                  <Ionicons name="flash" size={16} color={COLORS.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Cards */}
        <View style={styles.promoRow}>
          <View style={[styles.promoCard, { backgroundColor: `${COLORS.secondary}15` }]}>
            <Ionicons name="flash" size={22} color={COLORS.secondary} />
            <Text style={styles.promoLabel}>NEW OFFER</Text>
            <Text style={styles.promoTitle}>Get 20% off your first 3 rides!</Text>
          </View>
          <View style={[styles.promoCard, { backgroundColor: `${COLORS.tertiary}12` }]}>
            <Ionicons name="star" size={22} color={COLORS.tertiary} />
            <Text style={styles.promoLabel}>GO GREEN</Text>
            <Text style={styles.promoTitle}>All electric fleet options available.</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <Button
          title="Confirm Booking"
          onPress={handleBooking}
          loading={isBooking}
          size="lg"
          fullWidth
          icon={<Ionicons name="arrow-forward" size={22} color={COLORS.white} />}
          style={{ marginTop: SPACING.md }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  mapContainer: {
    height: 280,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.xl,
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    zIndex: 10,
  },
  locationMarker: {
    alignItems: 'center',
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  markerLabel: {
    marginTop: 6,
    backgroundColor: `${COLORS.white}EE`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  markerLabelText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
  },
  panel: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  panelContent: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.surface}EE`,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.md,
    marginBottom: SPACING.xxl,
  },
  locationDots: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLine: {
    width: 2,
    height: 40,
    backgroundColor: `${COLORS.outlineVariant}40`,
  },
  dotSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  locationInputs: {
    flex: 1,
    gap: 12,
  },
  locationLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurfaceVariant}80`,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputRowActive: {
    borderBottomWidth: 2,
    borderBottomColor: `${COLORS.primary}60`,
  },
  locationInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.onSurface,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.primary,
  },
  rideScroll: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  rideCard: {
    width: 140,
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  rideCardSelected: {
    backgroundColor: COLORS.surfaceHigh,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopRightRadius: RADIUS.lg - 2,
    borderBottomLeftRadius: RADIUS.md,
  },
  recommendedText: {
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  rideImage: {
    width: '100%',
    height: 70,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  rideName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  rideDesc: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ridePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  promoCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    height: 130,
    justifyContent: 'space-between',
  },
  promoLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 18,
  },
});
