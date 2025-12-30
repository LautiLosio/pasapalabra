'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

type NotificationType = 'error' | 'warning' | 'success' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const NOTIFICATION_DURATION = 3000;

const typeStyles: Record<NotificationType, { bg: string; border: string; icon: ReactNode }> = {
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    icon: <X size={18} className="text-red-400" />,
  },
  warning: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    icon: <AlertTriangle size={18} className="text-amber-400" />,
  },
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    icon: <CheckCircle size={18} className="text-green-400" />,
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    icon: <Info size={18} className="text-blue-400" />,
  },
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'warning') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    setNotifications(prev => {
      // Prevent duplicate messages showing at the same time
      if (prev.some(n => n.message === message)) return prev;
      return [...prev, { id, message, type }];
    });

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, NOTIFICATION_DURATION);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification container - fixed at top center */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map(notification => {
            const styles = typeStyles[notification.type];
            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`
                  pointer-events-auto flex items-center gap-3 
                  px-4 py-3 rounded-xl border backdrop-blur-xl
                  shadow-lg shadow-black/20
                  ${styles.bg} ${styles.border}
                `}
              >
                {styles.icon}
                <span className="text-white text-sm font-medium whitespace-nowrap">
                  {notification.message}
                </span>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

