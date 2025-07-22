import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const storageService = {
  // Upload a file
  uploadFile: async (file: Blob | Uint8Array | ArrayBuffer, path: string) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw error;
    }
  },

  // Get download URL
  getDownloadURL: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      throw error;
    }
  },

  // Delete a file
  deleteFile: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      throw error;
    }
  }
}; 