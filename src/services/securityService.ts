import * as LocalAuthentication from 'expo-local-authentication';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const SecurityService = {
  /**
   * Checks if biometrics are supported and enrolled on the device
   */
  checkBiometricsSupport: async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  /**
   * Authenticates the user via FaceID/Fingerprint
   */
  authenticateWithBiometrics: async (reason: string = 'Verify your identity to proceed'): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });
    return result.success;
  },

  /**
   * Updates the user's transaction PIN in Firestore
   */
  setTransactionPin: async (userId: string, pin: string): Promise<void> => {
     const userRef = doc(db, 'users', userId);
     await updateDoc(userRef, {
        transactionPin: pin,
        isBiometricsEnabled: true // Enable biometrics by default when PIN is set
     });
  },

  /**
   * Toggles biometric authentication setting
   */
  toggleBiometrics: async (userId: string, enabled: boolean): Promise<void> => {
     const userRef = doc(db, 'users', userId);
     await updateDoc(userRef, {
        isBiometricsEnabled: enabled
     });
  }
};
