import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { payRiderForMission } from '../services/walletService';
import SecurityVerificationModal from '../components/SecurityVerificationModal';



const { width, height } = Dimensions.get('window');

export default function ScanQRScreen({ navigation }: any) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);


  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleBarcodeScanned = async ({ data }: any) => {
    if (scanned) return;
    
    // Check for P2P Transfer format: FETCHTRANSFER:EMAIL
    if (data.startsWith('FETCHTRANSFER:')) {
      setScanned(true);
      const [_, recipientEmail] = data.split(':');
      
      navigation.replace('SendMoney', { prefilledEmail: recipientEmail });
      return;
    }

    // Check for FetchPay format: FETCHPAY:ORDER_ID:AMOUNT:RIDER_ID:RIDER_NAME
    if (data.startsWith('FETCHPAY:')) {
      setScanned(true);
      const [_, orderId, amount, riderId, riderName] = data.split(':');
      const numAmount = parseFloat(amount);

      setPaymentData({ orderId, numAmount, riderId, riderName });

      if (user?.transactionPin) {
        setShowSecurityModal(true);
      } else {
        Alert.alert(
          "Mission Payment",
          `Pay ₱${numAmount.toFixed(2)} to ${riderName}?`,
          [
            { text: "Cancel", style: "cancel", onPress: () => setScanned(false) },
            { text: "Pay Now", onPress: performPayment }
          ]
        );
      }
    }
  };

  const performPayment = async () => {
    if (!paymentData) return;
    const { orderId, numAmount, riderId, riderName } = paymentData;
    
    try {
      await payRiderForMission(orderId, user!.uid, riderId, numAmount);
      setShowSecurityModal(false);
      navigation.replace('Receipt', {
        data: {
          amount: numAmount,
          target: riderName,
          type: 'Courier Payment',
          id: `QR-${orderId.substring(0,6).toUpperCase()}`
        }
      });
    } catch (e: any) {
      Alert.alert("Transaction Failed", e.message);
      setScanned(false);
      setShowSecurityModal(false);
    }
  };



  if (!permission) return <View style={styles.container}><Text>Requesting for camera permission</Text></View>;
  if (!permission.granted) return <View style={styles.container}><Text>No access to camera</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        onBarcodeScanned={handleBarcodeScanned}
      />

      
      {/* Overlay */}
      <View style={styles.overlay}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
               <Ionicons name="close" size={32} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Merchant QR</Text>
            <TouchableOpacity>
               <Ionicons name="flashlight" size={24} color={COLORS.white} />
            </TouchableOpacity>
         </View>

         <View style={styles.scannerBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLine} />
         </View>

         <View style={styles.footer}>
            <Text style={styles.hint}>Align QR code within the frame to pay</Text>
            <TouchableOpacity style={styles.galleryBtn}>
               <Ionicons name="image-outline" size={24} color={COLORS.white} />
               <Text style={styles.galleryText}>Upload from Gallery</Text>
            </TouchableOpacity>
         </View>
      </View>
      <SecurityVerificationModal 
          visible={showSecurityModal}
          onSuccess={performPayment}
          onCancel={() => {
            setShowSecurityModal(false);
            setScanned(false);
          }}
          title="CONFIRM SHIPMENT"
          subtitle={paymentData ? `Authorize ₱${paymentData.numAmount} for #${paymentData.orderId.substring(0,6).toUpperCase()}` : ''}
       />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  scannerBox: {
    width: width * 0.7,
    height: width * 0.7,
    alignSelf: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: '50%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  footer: {
    alignItems: 'center',
    gap: 20,
  },
  hint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  galleryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
