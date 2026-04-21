import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';


import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Order, subscribeToOrder, submitRating } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';


const { width, height } = Dimensions.get('window');

export default function TrackingScreen({ navigation, route }: any) {
  const { orderId } = route.params || {};
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  
  // Rating State
  const [showRating, setShowRating] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrder(orderId, (data) => {
      setOrder(data);
      // Auto-trigger rating modal when completed
      if (data?.status === 'completed' && !data?.isRated) {
        setShowRating(true);
      }
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();

    // Pulse animation for the "Live" indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    return () => unsubscribe();
  }, [orderId]);

  const handleSubmitRating = async () => {
    if (score === 0) {
      Alert.alert("Rating Required", "Please select a star rating for your mission agent.");
      return;
    }

    setSubmitting(true);
    try {
      await submitRating(
        orderId, 
        user!.uid, 
        order?.riderId || 'system', 
        score, 
        comment, 
        'rider'
      );
      setShowRating(false);
      Alert.alert("Feedback Received", "Thank you! Your feedback helps keep the FetchMeUp fleet sharp.");
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (e) {
      Alert.alert("Error", "Mission report failed to transmit.");
    } finally {
      setSubmitting(false);
    }
  };



  const getStatusLabel = () => {
    switch (order?.status) {
      case 'pending': return 'SEARCHING FOR RUNNER';
      case 'accepted': return 'MISSION CONFIRMED';
      case 'picked_up': return 'EN-ROUTE TO YOU';
      case 'completed': return 'MISSION SUCCESSFUL';
      case 'cancelled': return 'MISSION ABORTED';
      default: return 'TRACKING SESSION';
    }
  };

  const currentStep = order?.status === 'pending' ? 0 : 
                      order?.status === 'accepted' ? 1 :
                      order?.status === 'picked_up' ? 2 : 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Immersive Live Map */}
      <View style={styles.mapContainer}>
         {!order ? (
           <View style={[styles.mapImage, { backgroundColor: '#1a202c', justifyContent: 'center' }]}>
              <ActivityIndicator color={COLORS.primary} size="large" />
           </View>
         ) : (
           <MapView
             provider={PROVIDER_GOOGLE}
             style={styles.mapImage}
             customMapStyle={darkMapStyle}
             initialRegion={{
               latitude: 8.9472, // Default to Butuan Central
               longitude: 125.5406,
               latitudeDelta: 0.05,
               longitudeDelta: 0.05,
             }}
             region={order.riderLocation ? {
               latitude: order.riderLocation.latitude,
               longitude: order.riderLocation.longitude,
               latitudeDelta: 0.02,
               longitudeDelta: 0.02,
             } : undefined}
           >
             {/* Rider Marker */}
             {order.riderLocation && (
               <Marker
                 coordinate={{
                   latitude: order.riderLocation.latitude,
                   longitude: order.riderLocation.longitude,
                 }}
                 anchor={{ x: 0.5, y: 0.5 }}
               >
                 <View style={styles.riderMarker}>
                    <View style={styles.riderMarkerInner}>
                       <Ionicons name="bicycle" size={18} color={COLORS.white} />
                    </View>
                    <View style={styles.riderMarkerArrow} />
                 </View>
               </Marker>
             )}

             {/* Destination Marker */}
             <Marker
               coordinate={{ latitude: 8.9450, longitude: 125.5350 }} // Placeholder target
               title="Delivery Point"
             >
                <View style={styles.destMarker}>
                   <Ionicons name="home" size={20} color={COLORS.primary} />
                </View>
             </Marker>
           </MapView>
         )}
         <LinearGradient
          colors={['rgba(15,20,25,0.4)', 'transparent', 'transparent', '#0f1419']}
          style={styles.mapOverlay}
         />
         
         <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
         >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
         </TouchableOpacity>

         <View style={styles.floatingRunnerCard}>
            <View style={styles.runnerAvatarBox}>
               <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop' }} 
                style={styles.runnerAvatar} 
               />
               <View style={styles.onlineBadge} />
            </View>
            <View>
               <Text style={styles.runnerRole}>PREMIUM RUNNER</Text>
               <Text style={styles.runnerName}>{order?.status === 'pending' || !order?.riderName ? 'Assigning Runner...' : order.riderName}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} disabled={order?.status === 'pending'}>
               <Ionicons name="call" size={18} color={COLORS.white} />
            </TouchableOpacity>
         </View>
      </View>

      {/* Control Panel */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        style={[styles.panel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={styles.panelContent}
      >
         <View style={styles.panelHeader}>
            <View style={styles.handle} />
            <View style={styles.statusRow}>
               <View>
                  <Text style={styles.statusMain}>{getStatusLabel()}</Text>
                  <View style={styles.liveIndicator}>
                     <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
                     <Text style={styles.liveText}>LIVE TELEMETRY</Text>
                  </View>
               </View>
               <View style={styles.etaBox}>
                  <Text style={styles.etaLabel}>EST. ARRIVAL</Text>
                  <Text style={styles.etaTime}>{order?.status === 'completed' ? '--' : '15 MIN'}</Text>
               </View>
            </View>
         </View>

         {/* Mission Progress */}
         <View style={styles.progressSection}>
            {[
              { id: 0, label: 'Order Validated', sub: 'Coordinates received' },
              { id: 1, label: 'Runner Assignment', sub: order?.riderName ? `${order.riderName} is preparing mission` : 'Matching closest agent' },
              { id: 2, label: 'En-Route', sub: 'Fetch in progress' },
              { id: 3, label: 'Secured Delivery', sub: 'Handled with care' },
            ].map((step, i) => (
               <View key={i} style={styles.progressStep}>
                  <View style={styles.stepIndicator}>
                     <View style={[
                        styles.stepDot, 
                        currentStep >= step.id && styles.stepDotActive,
                        currentStep === step.id && styles.stepDotCurrent
                     ]} />
                     {i < 3 && <View style={[styles.stepLine, currentStep > step.id && styles.stepLineActive]} />}
                  </View>
                  <View style={styles.stepText}>
                     <Text style={[styles.stepLabel, currentStep >= step.id && styles.stepLabelActive]}>{step.label}</Text>
                     <Text style={styles.stepSub}>{step.sub}</Text>
                  </View>
                  {currentStep > step.id && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
               </View>
            ))}
         </View>

         {/* Order Specification */}
         <View style={styles.specCard}>
            <View style={styles.specHeader}>
               <Text style={styles.specTitle}>MISSION SPECIFICATION</Text>
               <Text style={styles.specId}>ID: {orderId?.substring(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.specBody}>
               <View style={styles.specItem}>
                  <Text style={styles.specValue} numberOfLines={1}>{order?.pickupLocation || 'Loading...'}</Text>
                  <Text style={styles.specLabel}>PICKUP POINT</Text>
               </View>
               <View style={styles.specDivider} />
               <View style={styles.specItem}>
                  <Text style={styles.specValue} numberOfLines={1}>{order?.dropoffLocation || 'Loading...'}</Text>
                  <Text style={styles.specLabel}>DESTINATION</Text>
               </View>
            </View>
         </View>

         {/* Bottom Actions */}
         <View style={styles.actions}>
            <Button 
               title="Secure Chat" 
               onPress={() => navigation.navigate('Chat', { orderId })}
               variant="primary"
               size="xl"
               fullWidth
               icon={<Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />}
            />
            <TouchableOpacity style={styles.supportLink}>
               <Text style={styles.supportText}>Incident Report • Request Support</Text>
            </TouchableOpacity>
          </View>
       </Animated.ScrollView>


       {/* Interactive Rating Modal */}
       <Modal visible={showRating} transparent animationType="slide">
          <View style={styles.modalOverlay}>
             <KeyboardAvoidingView 
               behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
               style={styles.modalContainer}
             >
                <View style={styles.ratingPanel}>
                   <View style={styles.modalHandle} />
                   <Text style={styles.ratingHeading}>MISSION SUCCESSFUL</Text>
                   <Text style={styles.ratingSub}>How would you rate your mission agent,</Text>
                   <Text style={styles.agentName}>{order?.riderName || 'the Fetch Runner'}?</Text>

                   {/* Custom Star Rating */}
                   <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                         <TouchableOpacity 
                            key={star} 
                            onPress={() => setScore(star)}
                            activeOpacity={0.7}
                            style={styles.starTouch}
                         >
                            <Ionicons 
                               name={star <= score ? "star" : "star-outline"} 
                               size={44} 
                               color={star <= score ? "#FFB300" : "#E9ECEF"} 
                            />
                         </TouchableOpacity>
                      ))}
                   </View>

                   <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackLabel}>ADDITIONAL INTEL (OPTIONAL)</Text>
                      <TextInput 
                         style={styles.feedbackInput}
                         placeholder="What went well or could be better?"
                         placeholderTextColor="rgba(0,0,0,0.3)"
                         multiline
                         value={comment}
                         onChangeText={setComment}
                         maxLength={200}
                      />
                   </View>

                   <TouchableOpacity 
                      style={[styles.submitRatingBtn, score === 0 && styles.disabledBtn]} 
                      onPress={handleSubmitRating}
                      disabled={submitting || score === 0}
                   >
                      {submitting ? (
                         <ActivityIndicator color={COLORS.white} />
                      ) : (
                         <Text style={styles.submitRatingText}>TRANSMIT FEEDBACK</Text>
                      )}
                   </TouchableOpacity>

                   <TouchableOpacity 
                      style={styles.skipBtn} 
                      onPress={() => navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                      })}
                      disabled={submitting}
                   >

                      <Text style={styles.skipText}>SKIP FEEDBACK</Text>
                   </TouchableOpacity>
                </View>
             </KeyboardAvoidingView>
          </View>
       </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  mapContainer: {
    height: height * 0.5,
    width: '100%',
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingRunnerCard: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15,20,25,0.95)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  runnerAvatarBox: {
    position: 'relative',
  },
  runnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  onlineBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.tertiary,
    borderWidth: 2,
    borderColor: '#0f1419',
  },
  runnerRole: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
    marginBottom: 2,
  },
  runnerName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
  },
  callBtn: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    flex: 1,
    marginTop: -40,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  panelContent: {
    padding: 24,
    paddingBottom: 60,
  },
  panelHeader: {
    marginBottom: 32,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F1F3F5',
    alignSelf: 'center',
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusMain: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f1419',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  etaBox: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 0.5,
  },
  etaTime: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  progressSection: {
    marginBottom: 32,
    gap: 20,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1F3F5',
    zIndex: 1,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCurrent: {
    borderWidth: 3,
    borderColor: '#F8F9FA',
    transform: [{ scale: 1.4 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#F1F3F5',
    marginTop: 4,
    marginBottom: -16,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.2)',
  },
  stepLabelActive: {
    color: COLORS.onSurface,
  },
  stepSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  specCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  specHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  specTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.3)',
  },
  specId: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  specBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  specLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  specDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: '#E9ECEF',
    marginHorizontal: 16,
  },
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  supportLink: {
    paddingVertical: 12,
  },
  supportText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.25)',
    letterSpacing: 0.5,
  },
  riderMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  riderMarkerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.white,
    marginTop: -2,
  },
  destMarker: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: COLORS.white,
     borderWidth: 2,
     borderColor: COLORS.primary,
     alignItems: 'center',
     justifyContent: 'center',
     ...SHADOWS.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  ratingPanel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    alignItems: 'center',
    paddingBottom: 50,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#F1F3F5',
    borderRadius: 2,
    marginBottom: 32,
  },
  ratingHeading: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.tertiary,
    marginBottom: 12,
  },
  ratingSub: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
    textAlign: 'center',
  },
  agentName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  starTouch: {
    padding: 2,
  },
  feedbackBox: {
    width: '100%',
    marginBottom: 32,
  },
  feedbackLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 12,
  },
  feedbackInput: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  submitRatingBtn: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  submitRatingText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  skipBtn: {
    marginTop: 20,
    padding: 12,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 0.5,
  }
});


const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];
