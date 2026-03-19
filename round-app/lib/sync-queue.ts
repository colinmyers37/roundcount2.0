import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = 'sync_queue';

export interface QueuedMutation {
  id: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  createdAt: number;
}

async function loadQueue(): Promise<QueuedMutation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: QueuedMutation[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueue(mutation: Omit<QueuedMutation, 'id' | 'createdAt'>) {
  const queue = await loadQueue();
  queue.push({ ...mutation, id: Date.now().toString(), createdAt: Date.now() });
  await saveQueue(queue);
}

export async function flushQueue(): Promise<void> {
  const queue = await loadQueue();
  if (queue.length === 0) return;

  const remaining: QueuedMutation[] = [];
  for (const item of queue) {
    try {
      await api.request({ method: item.method, url: item.url, data: item.data });
    } catch {
      remaining.push(item);
    }
  }
  await saveQueue(remaining);
}
