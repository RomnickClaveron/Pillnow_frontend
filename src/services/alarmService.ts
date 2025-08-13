import PushNotification from 'react-native-push-notification';
import { arduinoApiService } from './arduinoApiService';
import { firebaseService } from './firebaseService';
import { ContainerData } from '../types/container';

class AlarmService {
  private static instance: AlarmService;
  private scheduledAlarms: { [key: string]: NodeJS.Timeout } = {};
  private isPushNotificationsConfigured = false;

  private constructor() {
    this.setupPushNotifications();
  }

  public static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  private setupPushNotifications() {
    try {
      if (!PushNotification) {
        console.warn('PushNotification is not available');
        return;
      }

      if (this.isPushNotificationsConfigured) {
        return;
      }

      PushNotification.configure({
        onRegister: function(token) {
          console.log('TOKEN:', token);
        },
        onNotification: function(notification) {
          console.log('NOTIFICATION:', notification);
          // Add null check before calling finish
          if (notification && typeof notification.finish === 'function') {
            notification.finish('default');
          }
        },
        onAction: function(notification) {
          console.log('ACTION:', notification.action);
          console.log('NOTIFICATION:', notification);
        },
        onRegistrationError: function(err) {
          console.error('Registration Error:', err);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: false, // Changed to false to prevent the error
        requestPermissions: true,
      });

      this.isPushNotificationsConfigured = true;
      
      // Safely handle initial notification if needed
      try {
        PushNotification.popInitialNotification((notification) => {
          if (notification) {
            console.log('Initial notification found:', notification);
          }
        });
      } catch (error) {
        console.log('No initial notification or error reading it:', error);
      }
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  async scheduleAlarms(containerId: string) {
    try {
      // Get container data from Firebase
      const container = await firebaseService.getContainer(containerId) as ContainerData;
      if (!container) {
        throw new Error('Container not found');
      }

      // Clear existing alarms for this container
      this.clearAlarms(containerId);

      // Schedule new alarms
      for (const alarmTime of container.alarms) {
        const now = new Date();
        const alarmDate = new Date(alarmTime);
        
        // If the alarm time has passed for today, schedule for tomorrow
        if (alarmDate < now) {
          alarmDate.setDate(alarmDate.getDate() + 1);
        }

        const timeUntilAlarm = alarmDate.getTime() - now.getTime();
        
        const timeoutId = setTimeout(async () => {
          try {
            // Trigger Arduino alarm
            await arduinoApiService.triggerAlarm();
            
            // Send push notification
            if (this.isPushNotificationsConfigured) {
              PushNotification.localNotification({
                title: 'Medicine Reminder',
                message: `Time to take your medicine from ${container.name}`,
                playSound: true,
                soundName: 'default',
              });
            }

            // Send SMS if phone number is available
            if (container.phoneNumber) {
              await arduinoApiService.sendSMS(
                container.phoneNumber,
                `Time to take your medicine from ${container.name}`
              );
            }

            // Schedule next alarm for tomorrow
            this.scheduleAlarms(containerId);
          } catch (error) {
            console.error('Error in alarm execution:', error);
          }
        }, timeUntilAlarm);

        this.scheduledAlarms[`${containerId}-${alarmTime}`] = timeoutId;
      }
    } catch (error) {
      console.error('Error scheduling alarms:', error);
      throw error;
    }
  }

  clearAlarms(containerId: string) {
    Object.entries(this.scheduledAlarms).forEach(([key, timeoutId]) => {
      if (key.startsWith(containerId)) {
        clearTimeout(timeoutId);
        delete this.scheduledAlarms[key];
      }
    });
  }

  stopAlarm() {
    return arduinoApiService.stopAlarm();
  }
}

export const alarmService = AlarmService.getInstance();