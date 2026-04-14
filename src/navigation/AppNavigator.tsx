import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

// Screens
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import FoodDeliveryScreen from '../screens/FoodDeliveryScreen';
import RideSelectionScreen from '../screens/RideSelectionScreen';
import ParcelDeliveryScreen from '../screens/ParcelDeliveryScreen';
import TrackingScreen from '../screens/TrackingScreen';
import TrackingTabScreen from '../screens/TrackingTabScreen';
import ChatScreen from '../screens/ChatScreen';
import StoreDirectoryScreen from '../screens/StoreDirectoryScreen';
import PabiliOrderScreen from '../screens/PabiliOrderScreen';
import RiderPortalScreen from '../screens/RiderPortalScreen';
import RiderDashboardScreen from '../screens/RiderDashboardScreen';
import RiderJobsScreen from '../screens/RiderJobsScreen';
import RiderProfileScreen from '../screens/RiderProfileScreen';
import RiderEarningsScreen from '../screens/RiderEarningsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import GenericContentScreen from '../screens/GenericContentScreen';
import AddressEditScreen from '../screens/AddressEditScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Activity') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Tracking') iconName = focused ? 'location' : 'location-outline';
          else if (route.name === 'Account') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: `${COLORS.onSurface}60`,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Tracking" component={TrackingTabScreen} />
      <Tab.Screen name="Account" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

function RiderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Jobs') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Earnings') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: `${COLORS.onSurface}60`,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Dashboard" component={RiderDashboardScreen} />
      <Tab.Screen name="Jobs" component={RiderJobsScreen} />
      <Tab.Screen name="Earnings" component={RiderEarningsScreen} />
      <Tab.Screen name="Profile" component={RiderProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.surface },
          animation: 'slide_from_right',
        }}
        initialRouteName="Landing"
      >
        {/* Auth Flow */}
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        
        {/* Main User Flow */}
        <Stack.Screen name="MainTabs" component={UserTabs} />
        <Stack.Screen name="FoodDelivery" component={FoodDeliveryScreen} />
        <Stack.Screen name="RideSelection" component={RideSelectionScreen} />
        <Stack.Screen name="ParcelDelivery" component={ParcelDeliveryScreen} />
        <Stack.Screen name="TrackingDetail" component={TrackingScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="StoreDirectory" component={StoreDirectoryScreen} />
        <Stack.Screen name="PabiliOrder" component={PabiliOrderScreen} />
        
        {/* Rider Flow */}
        <Stack.Screen name="RiderPortal" component={RiderPortalScreen} />
        <Stack.Screen name="RiderTabs" component={RiderTabs} />
        <Stack.Screen name="RiderDashboard" component={RiderDashboardScreen} />
        
        {/* Universal Sub-Screens */}
        <Stack.Screen name="AddressEdit" component={AddressEditScreen} />
        <Stack.Screen name="GenericContent" component={GenericContentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
    backgroundColor: `${COLORS.surface}EE`,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    paddingTop: 8,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.white}30`,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
