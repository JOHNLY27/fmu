import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

let locationSubscription: Location.LocationSubscription | null = null;

export const startRiderLocationTracking = async (orderId: string) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    // Stop any existing tracking
    if (locationSubscription) {
      locationSubscription.remove();
    }

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or every 10 meters
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        const orderRef = doc(db, 'orders', orderId);
        
        try {
          await updateDoc(orderRef, {
            riderLocation: {
              latitude,
              longitude,
              heading: location.coords.heading,
              lastUpdated: new Date().toISOString()
            }
          });
        } catch (error) {
          console.log('Error updating rider location:', error);
        }
      }
    );
  } catch (error) {
    console.log('Error starting location tracking:', error);
  }
};

export const stopRiderLocationTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};
