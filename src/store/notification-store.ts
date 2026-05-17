import { create } from "zustand";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
};

type NotificationStore = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (title, message) =>
    set((state) => {
      const newNotif: AppNotification = {
        id: crypto.randomUUID(),
        title,
        message,
        read: false,
        timestamp: new Date().toISOString(),
      };
      const updated = [newNotif, ...state.notifications].slice(0, 50); // Keep max 50
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
