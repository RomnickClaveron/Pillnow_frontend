import { db } from '../config/firebase';
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
  QueryConstraint
} from 'firebase/firestore';

export const databaseService = {
  // Create a new document
  create: async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Read a single document
  read: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Update a document
  update: async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Delete a document
  delete: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Query documents
  query: async (collectionName: string, conditions: QueryConstraint[] = [], orderByField?: string, limitCount?: number) => {
    try {
      let q = collection(db, collectionName);
      let queryConstraints: QueryConstraint[] = [...conditions];
      
      // Add order by
      if (orderByField) {
        queryConstraints.push(orderBy(orderByField));
      }
      
      // Add limit
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      
      const finalQuery = query(q, ...queryConstraints);
      const querySnapshot = await getDocs(finalQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  }
}; 