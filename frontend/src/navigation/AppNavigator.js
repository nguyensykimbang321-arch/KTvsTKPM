import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import VNPayScreen from '../screens/VNPayScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import StaffDashboardScreen from '../screens/StaffDashboardScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import ManageStaffScreen from '../screens/ManageStaffScreen';
import RevenueScreen from '../screens/RevenueScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ManageCategoriesScreen from '../screens/ManageCategoriesScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main App with Persistent Bottom Tabs */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Child Screens (Hide Bottom Nav) */}
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="VNPay" component={VNPayScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
        <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
        <Stack.Screen name="ManageStaff" component={ManageStaffScreen} />
        <Stack.Screen name="Revenue" component={RevenueScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
