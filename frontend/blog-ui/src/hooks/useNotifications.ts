import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
} from '../api';

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  created_at: string;
  actor?: {
    id: number;
    name?: string;
    email?: string;
    avatar?: string;
  };
  post?: {
    id: number;
  };
  comment?: {
    id: number;
  };
}

interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  unreadCount: number;
  notificationsLoading: boolean;
  showNotificationsDropdown: boolean;
  notificationMenus: { [key: number]: boolean };
  
  // Refs
  notificationsDropdownRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  setShowNotificationsDropdown: (show: boolean) => void;
  loadNotifications: () => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  handleNotificationClick: (notification: Notification) => Promise<void>;
  handleNotificationMenuToggle: (notificationId: number, event: React.MouseEvent) => void;
  handleToggleNotificationRead: (notificationId: number, isRead: boolean) => Promise<void>;
  handleDeleteNotification: (notificationId: number) => Promise<void>;
}

export function useNotifications(userId: number | null): UseNotificationsReturn {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notificationMenus, setNotificationMenus] = useState<{ [key: number]: boolean }>({});
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  async function loadNotifications(showLoading = false) {
    if (!userId) return;
    
    try {
      if (showLoading) {
        setNotificationsLoading(true);
      }
      const [notificationsData, unreadData] = await Promise.all([
        getNotifications(userId),
        getUnreadNotificationCount(userId)
      ]);
      
      // Check if there are new notifications
      const previousUnreadCount = unreadCount;
      const newUnreadCount = unreadData.count;
      
      setNotifications(notificationsData);
      setUnreadCount(newUnreadCount);
      
      // Show a subtle notification if new notifications arrived
      if (newUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
        toast.info(`You have ${newUnreadCount - previousUnreadCount} new notification${newUnreadCount - previousUnreadCount > 1 ? 's' : ''}!`, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      if (showLoading) {
        setNotificationsLoading(false);
      }
    }
  }

  // Mark all notifications as read
  async function handleMarkAllAsRead() {
    if (!userId) return;
    
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  // Handle notification click
  async function handleNotificationClick(notification: Notification) {
    if (!userId) return;

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id, userId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setShowNotificationsDropdown(false);

      if (notification.post?.id) {
        navigate(`/post/${notification.post.id}${notification.comment?.id ? `?comment=${notification.comment.id}` : ''}`);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  }

  // Handle notification menu toggle
  function handleNotificationMenuToggle(notificationId: number, event: React.MouseEvent) {
    event.stopPropagation();
    setNotificationMenus(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  }

  // Handle toggle notification read status
  async function handleToggleNotificationRead(notificationId: number, isRead: boolean) {
    if (!userId) return;

    try {
      if (isRead) {
        await markNotificationAsUnread(notificationId, userId);
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: false } : n
        ));
        setUnreadCount(prev => prev + 1);
      } else {
        await markNotificationAsRead(notificationId, userId);
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotificationMenus(prev => ({ ...prev, [notificationId]: false }));
      toast.success(isRead ? 'Notification marked as unread' : 'Notification marked as read');
    } catch (error) {
      console.error('Failed to toggle notification read status:', error);
      toast.error('Failed to update notification');
    }
  }

  // Handle delete notification
  async function handleDeleteNotification(notificationId: number) {
    if (!userId) return;

    try {
      await deleteNotification(notificationId, userId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotificationMenus(prev => ({ ...prev, [notificationId]: false }));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsDropdown(false);
        setNotificationMenus({});
      }
    };

    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  // Load notifications when userId changes
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  // Real-time polling for notifications
  useEffect(() => {
    if (!userId) return;

    // Poll for new notifications every 5 seconds
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 5000); // 5 seconds

    // Also poll when the page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNotifications();
      }
    };

    // Poll when user interacts with the page (focus, click, etc.)
    const handleUserActivity = () => {
      loadNotifications();
    };

    // Poll when user scrolls (they're actively using the app)
    const handleScroll = () => {
      loadNotifications();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('focus', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('focus', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userId]);

  return {
    // State
    notifications,
    unreadCount,
    notificationsLoading,
    showNotificationsDropdown,
    notificationMenus,
    
    // Refs
    notificationsDropdownRef,
    
    // Actions
    setShowNotificationsDropdown,
    loadNotifications: () => loadNotifications(true), // Always show loading for manual refresh
    handleMarkAllAsRead,
    handleNotificationClick,
    handleNotificationMenuToggle,
    handleToggleNotificationRead,
    handleDeleteNotification,
  };
}
