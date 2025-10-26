import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './utils/notificationSetup.js'; 
import Toast from 'react-native-toast-message';
import { showInAppNotification } from './utils/ToastHandler';
import { auth, db } from './firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef();


  useEffect(() => {
    const loadStorage = async () => {
      try {
        const onboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const role = await AsyncStorage.getItem('userRole');

        setShowOnboarding(onboarding === null);
        setIsLoggedIn(loggedIn === 'true');
        setUserRole(role);
      } catch (error) {
        console.log('⚠️ Error loading storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorage();
  }, []);


  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        if (!auth.currentUser) {
          console.log('⚠️ No user logged in yet, skipping token registration.');
          return;
        }

        const token = await registerForPushNotificationsAsync(auth.currentUser.uid); 
        if (token) {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            { expoPushToken: token },
            { merge: true }
          );
          console.log('📱 Push token saved to Firestore');
        } else {
          console.log('⚠️ Expo Go limitation: push tokens unavailable. Use dev build later.');
        }
      } catch (err) {
        console.log('🔴 Error setting up push notifications:', err);
      }
    };

    setupPushNotifications();


    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title || 'New Notification';
      const body = notification.request.content.body || '';
      showInAppNotification(title, body); 
    });


    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.screen && navigationRef.current) {
        navigationRef.current.navigate(data.screen, data.params || {});
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading VastraMitra...</Text>
      </View>
    );
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator
          showOnboarding={showOnboarding}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
        />
      </NavigationContainer>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
  },
});

export default App;
