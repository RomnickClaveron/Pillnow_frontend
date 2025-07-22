import { bluetoothService } from './bluetoothService';

class ArduinoApiService {
  // Initialize Arduino connection
  async initialize() {
    try {
      await bluetoothService.initialize();
      await bluetoothService.scanForDevice();
      await bluetoothService.connect();
      return true;
    } catch (error) {
      console.error('Arduino initialization error:', error);
      throw error;
    }
  }

  // Send command to Arduino
  async sendCommand(command: string) {
    try {
      await bluetoothService.sendCommand(command);
      return true;
    } catch (error) {
      console.error('Command sending error:', error);
      throw error;
    }
  }

  // Test Arduino connection
  async testConnection() {
    try {
      await this.initialize();
      await this.sendCommand('TEST');
      await bluetoothService.disconnect();
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      throw error;
    }
  }

  // Trigger alarm (buzzer and LED)
  async triggerAlarm() {
    try {
      await this.initialize();
      await this.sendCommand('ALARM_ON');
      return true;
    } catch (error) {
      console.error('Alarm trigger error:', error);
      throw error;
    }
  }

  // Stop alarm
  async stopAlarm() {
    try {
      await this.sendCommand('ALARM_OFF');
      await bluetoothService.disconnect();
      return true;
    } catch (error) {
      console.error('Alarm stop error:', error);
      throw error;
    }
  }

  // Send SMS via SIM800L
  async sendSMS(phoneNumber: string, message: string) {
    try {
      await this.initialize();
      await bluetoothService.sendSMS(phoneNumber, message);
      await bluetoothService.disconnect();
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      throw error;
    }
  }

  // Get Arduino status
  async getStatus() {
    try {
      await this.initialize();
      await this.sendCommand('STATUS');
      await bluetoothService.disconnect();
      return true;
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }
}

export const arduinoApiService = new ArduinoApiService(); 