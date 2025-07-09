'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { db, storage } from '@/lib/firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

export interface HistoryItem {
  id: string;
  type: string;
  date: string; // Keep as string for simplicity in the UI
  content: string;
  audioUrl: string | null;
}

// Type for data coming from Firestore
interface FirestoreHistoryItem {
  type: string;
  date: Timestamp;
  content: string;
  audioUrl: string | null;
}

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'date'>) => Promise<void>;
  loading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const historyCollection = collection(db, 'history');
    const q = query(historyCollection, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const historyData = querySnapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreHistoryItem;
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
          };
        });
        setHistory(historyData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching history: ', error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addHistoryItem = async (
    item: Omit<HistoryItem, 'id' | 'date'>
  ) => {
    let finalAudioUrl = item.audioUrl;

    // If there's an audioUrl and it's a data URI, upload to Storage
    if (item.audioUrl && item.audioUrl.startsWith('data:')) {
      try {
        const storageRef = ref(
          storage,
          `history_audio/${new Date().toISOString()}.wav`
        );
        const uploadResult = await uploadString(
          storageRef,
          item.audioUrl,
          'data_url'
        );
        finalAudioUrl = await getDownloadURL(uploadResult.ref);
      } catch (error) {
        console.error('Error uploading audio to Firebase Storage: ', error);
        // We can decide to still save the history item without the audio or show an error
        finalAudioUrl = null; // Or handle error appropriately
      }
    }

    try {
      await addDoc(collection(db, 'history'), {
        ...item,
        audioUrl: finalAudioUrl,
        date: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding document to Firestore: ', error);
    }
  };

  return React.createElement(
    HistoryContext.Provider,
    { value: { history, addHistoryItem, loading } },
    children
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
