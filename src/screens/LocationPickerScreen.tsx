import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

// Default to Butuan City center
const DEFAULT_LOCATION = {
  latitude: 8.9472,
  longitude: 125.5415,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function LocationPickerScreen({ navigation, route }: any) {
  const [region, setRegion] = useState<Region>(DEFAULT_LOCATION);
  const [address, setAddress] = useState('Fetching address...');
  const [loading, setLoading] = useState(true);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newRegion = {
          ...DEFAULT_LOCATION,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        reverseGeocode(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (result.length > 0) {
        const item = result[0];
        // Build a readable address string
        const parts = [
          item.name,
          item.street,
          item.district || item.subregion,
          item.city,
        ].filter(Boolean);
        
        setAddress(parts.join(', ') || 'Unknown Location');
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress('Error fetching address');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirm = () => {
    if (route.params?.onLocationSelect) {
      route.params.onLocationSelect({
        latitude: region.latitude,
        longitude: region.longitude,
        address: address,
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_LOCATION}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{route.params?.title || 'Set Pickup Point'}</Text>
        </View>
      </View>

      {/* Center Marker (Fixed Pin) */}
      <View style={styles.markerFixed} pointerEvents="none">
        <View style={styles.markerContainer}>
          <View style={styles.markerIcon}>
            <Ionicons name="location" size={40} color={COLORS.primary} />
          </View>
          <View style={styles.markerShadow} />
        </View>
      </View>

      {/* Bottom Interface Card */}
      <View style={styles.bottomCard}>
        <View style={styles.addressBox}>
          <View style={styles.locIcon}>
            {isReverseGeocoding ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="map" size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>CONFIRM LOCATION</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {loading ? 'Initializing map...' : address}
            </Text>
          </View>
        </View>

        <Button
          title="CONFIRM THIS LOCATION"
          onPress={handleConfirm}
          variant="primary"
          size="xl"
          fullWidth
          disabled={loading || isReverseGeocoding}
        />
      </View>

      {/* Locate Me FAB */}
      <TouchableOpacity
        style={styles.myLocationBtn}
        onPress={async () => {
          let location = await Location.getCurrentPositionAsync({});
          mapRef.current?.animateToRegion({
            ...region,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }, 1000);
        }}
      >
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  titleContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...SHADOWS.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  markerFixed: {
    position: 'absolute',
    top: (height / 2) - 40,
    left: (width / 2) - 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    transform: [{ translateY: -20 }], // Lift it so the tip is at the exact center
  },
  markerIcon: {
    marginBottom: -2,
  },
  markerShadow: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    ...SHADOWS.lg,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  locIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  myLocationBtn: {
    position: 'absolute',
    bottom: 250,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
});
