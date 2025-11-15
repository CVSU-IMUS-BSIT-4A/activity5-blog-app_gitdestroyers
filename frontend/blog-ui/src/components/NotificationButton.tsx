import { Button } from './ui/button';
import { Bell, MoreVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationButtonProps {
  userId: number | null;
}

export default function NotificationButton({ userId }: NotificationButtonProps) {
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    showNotificationsDropdown,
    notificationMenus,
    notificationsDropdownRef,
    setShowNotificationsDropdown,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleNotificationMenuToggle,
    handleToggleNotificationRead,
    handleDeleteNotification,
  } = useNotifications(userId);

  return (
    <div className="relative" ref={notificationsDropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0 relative"
        onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
      >
        <Bell className={`h-4 w-4 ${notificationsLoading ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {notificationsLoading && unreadCount === 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </Button>

      {showNotificationsDropdown && (
        <div className="absolute right-0 top-11 w-auto min-w-80 max-w-96 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-6 px-2"
                >
                  Mark all read
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notificationsLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors relative ${
                      !notification.isRead
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                        : 'bg-muted/30 border-border'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
                        {notification.actor?.avatar ? (
                          <img
                            src={`http://localhost:3005${notification.actor.avatar}`}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : notification.actor?.name ? (
                          notification.actor.name.charAt(0).toUpperCase()
                        ) : (
                          'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground break-words">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()} at{' '}
                          {new Date(notification.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="relative flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleNotificationMenuToggle(notification.id, e)}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                        {notificationMenus[notification.id] && (
                          <div className="absolute right-0 top-8 bg-background border border-border rounded-lg shadow-lg z-50 min-w-32">
                            <div className="py-1">
                              <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleNotificationRead(notification.id, notification.isRead);
                                }}
                              >
                                {notification.isRead ? (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Mark unread
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    Mark read
                                  </>
                                )}
                              </button>
                              <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
