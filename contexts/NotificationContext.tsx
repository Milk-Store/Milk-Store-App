import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '../services/api';

interface NotificationContextData {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  notificationCount: number;
  clearNotificationCount: () => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID, // Thêm project ID từ app.json
      })).data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Gửi token lên server khi có token mới
        api.notifications.registerToken(token).catch(console.error);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      setNotificationCount(prev => prev + 1);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Xử lý khi user tap vào notification
      const data = response.notification.request.content.data;
      if (data.type === 'NEW_ORDER') {
        // Có thể thêm logic navigate đến màn orders
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      // Hủy đăng ký token khi unmount
      if (expoPushToken) {
        api.notifications.unregisterToken().catch(console.error);
      }
    };
  }, []);

  const clearNotificationCount = () => {
    setNotificationCount(0);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        expoPushToken, 
        notification, 
        notificationCount,
        clearNotificationCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 