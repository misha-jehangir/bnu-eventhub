import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Bell, Calendar, Check, CheckCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="h-20" /></Card>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/50',
                    !notification.is_read && 'border-primary/50 bg-primary/5'
                  )}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                    if (notification.event_id) navigate(`/event/${notification.event_id}`);
                  }}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      notification.is_read ? 'bg-muted' : 'bg-primary/10'
                    )}>
                      <Bell className={cn('h-5 w-5', !notification.is_read && 'text-primary')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium', !notification.is_read && 'text-primary')}>{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
