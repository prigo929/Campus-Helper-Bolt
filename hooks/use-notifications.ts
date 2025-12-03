'use client';

import { useEffect, useMemo, useState } from 'react';

export type NotificationType = 'message' | 'job' | 'comment';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: NotificationType;
  read: boolean;
};

const STORAGE_KEY = 'ch-notifications';

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'seed-1',
    title: 'New message',
    body: 'Alex replied to your chat about the tutoring job.',
    type: 'message',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 'seed-2',
    title: 'Job interest',
    body: 'Jamie wants to help with “Event setup on Saturday”.',
    type: 'job',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
  },
  {
    id: 'seed-3',
    title: 'Comment on your post',
    body: 'Taylor commented on “Best places to study late?”.',
    type: 'comment',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(SEED_NOTIFICATIONS);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotifications(SEED_NOTIFICATIONS);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && notifications.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Failed to persist notifications', error);
    }
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
