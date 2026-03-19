import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { flushQueue } from './sync-queue';

export function useOfflineSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        flushQueue().catch(console.warn);
      }
    });
    return () => unsubscribe();
  }, []);
}
