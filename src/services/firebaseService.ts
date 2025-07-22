import { db, auth } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { ContainerData } from '../types/container';

class FirebaseService {
  // Get user's containers
  async getUserContainers(userId: string) {
    try {
      const containersRef = collection(db, 'containers');
      const q = query(containersRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting containers:', error);
      throw error;
    }
  }

  // Get specific container
  async getContainer(containerId: string): Promise<ContainerData | null> {
    try {
      const containerRef = doc(db, 'containers', containerId);
      const containerSnap = await getDoc(containerRef);
      
      if (containerSnap.exists()) {
        const data = containerSnap.data();
        // Ensure required fields are present
        if (!data.userId || !data.name || !data.alarms) {
          throw new Error('Container data is missing required fields');
        }
        // Create a properly typed ContainerData object
        const containerData: ContainerData = {
          id: containerSnap.id,
          userId: data.userId,
          name: data.name,
          description: data.description || '',
          alarms: data.alarms,
          phoneNumber: data.phoneNumber || '',
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date()
        };
        return containerData;
      }
      return null;
    } catch (error) {
      console.error('Error getting container:', error);
      throw error;
    }
  }

  // Create new container
  async createContainer(containerData: ContainerData) {
    try {
      const containersRef = collection(db, 'containers');
      const docRef = await addDoc(containersRef, {
        ...containerData,
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  }

  // Update container
  async updateContainer(containerId: string, containerData: Partial<ContainerData>) {
    try {
      const containerRef = doc(db, 'containers', containerId);
      await updateDoc(containerRef, {
        ...containerData,
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating container:', error);
      throw error;
    }
  }

  // Delete container
  async deleteContainer(containerId: string) {
    try {
      const containerRef = doc(db, 'containers', containerId);
      await deleteDoc(containerRef);
      return true;
    } catch (error) {
      console.error('Error deleting container:', error);
      throw error;
    }
  }

  // Get container alarms
  async getContainerAlarms(containerId: string) {
    try {
      const containerRef = doc(db, 'containers', containerId);
      const containerSnap = await getDoc(containerRef);
      
      if (containerSnap.exists()) {
        const data = containerSnap.data();
        return data.alarms || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting container alarms:', error);
      throw error;
    }
  }

  // Update container alarms
  async updateContainerAlarms(containerId: string, alarms: string[]) {
    try {
      const containerRef = doc(db, 'containers', containerId);
      await updateDoc(containerRef, {
        alarms,
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating container alarms:', error);
      throw error;
    }
  }

  // Get user's phone number
  async getUserPhoneNumber(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return data.phoneNumber || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user phone number:', error);
      throw error;
    }
  }

  // Update user's phone number
  async updateUserPhoneNumber(userId: string, phoneNumber: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber,
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating user phone number:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();