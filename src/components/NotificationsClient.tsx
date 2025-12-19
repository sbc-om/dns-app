'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter,
  BellRing,
  Calendar,
  MessageSquare,
  UserPlus,
  Settings,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  BellOff,
  Clock,
  Eye,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import { cn } from '@/lib/utils';
import { 
  getNotificationsAction, 
  markAsReadAction, 
  markAllAsReadAction, 
  deleteNotificationAction 
} from '@/lib/actions/notificationActions';
import type { Notification } from '@/lib/db/repositories/notificationRepository';

interface NotificationsClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationCategory = 'all' | 'system' | 'appointments' | 'users' | 'messages';

export function NotificationsClient({ dictionary, locale }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const result = await getNotificationsAction();
      if (result.success && result.notifications) {
        // Convert timestamp strings to Date objects if needed
        const parsedNotifications = result.notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedNotifications as any);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: NotificationType, category: NotificationCategory) => {
    if (category === 'appointments') return Calendar;
    if (category === 'users') return UserPlus;
    if (category === 'messages') return MessageSquare;
    if (category === 'system') return Settings;
    
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'warning': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'error': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      default: return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    }
  };

  const getNotificationBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500';
      case 'warning': return 'border-l-amber-500';
      case 'error': return 'border-l-rose-500';
      default: return 'border-l-orange-500';
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86301600);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    await markAsReadAction(id);
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    await markAllAsReadAction();
  };

  const deleteNotification = async (id: string) => {
    // Optimistic update
    setNotifications(notifications.filter(n => n.id !== id));
    
    await deleteNotificationAction(id);
  };

  const filteredNotifications = notifications.filter(n => {
    const categoryMatch = activeTab === 'all' || n.category === activeTab;
    const readMatch = filter === 'all' || (filter === 'unread' ? !n.read : n.read);
    return categoryMatch && readMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-6">
      {/* Premium Header with Stats */}
      <div className="relative overflow-hidden rounded-xl bg-orange-500 p-8 shadow-lg border border-orange-600">
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  {unreadCount > 0 ? (
                    <BellRing className="h-8 w-8 text-orange-500" />
                  ) : (
                    <Bell className="h-8 w-8 text-orange-500" />
                  )}
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-rose-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-4 ring-orange-400">
                    {unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-4">
                  Notifications
                  {unreadCount === 0 && <CheckCircle className="h-7 w-7 text-white" />}
                </h1>
                <p className="text-white text-base font-medium">
                  {unreadCount > 0 
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} waiting` 
                    : 'All notifications have been read'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="gap-2 bg-white hover:bg-orange-50 text-orange-600 border-2 border-white font-semibold shadow-md"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-orange-500" />
                    Filter by Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter('all')} className="gap-2">
                    <BellRing className="h-4 w-4" />
                    All Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')} className="gap-2">
                    <Eye className="h-4 w-4" />
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('read')} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Read Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={markAllAsRead}
                  className="gap-2 bg-white hover:bg-orange-50 text-orange-600 border-2 border-white font-semibold shadow-md"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </Button>
              )}

              {notifications.filter(n => n.read).length > 0 && (
                <Button
                  size="sm"
                  onClick={() => {}} // Not implemented yet
                  className="gap-2 bg-white hover:bg-rose-50 text-rose-600 border-2 border-white font-semibold shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Read</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-orange-600 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  <p className="text-sm text-gray-600 font-medium">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-orange-600 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-rose-100 flex items-center justify-center">
                  <BellRing className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                  <p className="text-sm text-gray-600 font-medium">Unread</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-orange-600 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => n.read).length}</p>
                  <p className="text-sm text-gray-600 font-medium">Read</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-orange-600 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => {
                      const diff = new Date().getTime() - new Date(n.timestamp).getTime();
                      return diff < 86400000; // 24 hours
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Premium Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationCategory)} className="space-y-6">
          <TabsList className="w-full sm:w-auto bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-1.5 h-auto gap-2">
            <TabsTrigger 
              value="all" 
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-lg rounded-lg px-4 py-2.5 transition-all text-gray-700 dark:text-gray-300 font-semibold"
            >
              <BellRing className="h-4 w-4" />
              <span>All</span>
              <Badge className="ml-1 bg-orange-600 text-white border-0 h-5 min-w-[20px] px-1.5">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-lg rounded-lg px-4 py-2.5 transition-all text-gray-700 dark:text-gray-300 font-semibold"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
              <Badge className="ml-1 bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100 border-0 h-5 min-w-[20px] px-1.5">
                {notifications.filter(n => n.category === 'appointments').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-lg rounded-lg px-4 py-2.5 transition-all text-gray-700 dark:text-gray-300 font-semibold"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
              <Badge className="ml-1 bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100 border-0 h-5 min-w-[20px] px-1.5">
                {notifications.filter(n => n.category === 'users').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-lg rounded-lg px-4 py-2.5 transition-all text-gray-700 dark:text-gray-300 font-semibold"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
              <Badge className="ml-1 bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100 border-0 h-5 min-w-[20px] px-1.5">
                {notifications.filter(n => n.category === 'messages').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-lg rounded-lg px-4 py-2.5 transition-all text-gray-700 dark:text-gray-300 font-semibold"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
              <Badge className="ml-1 bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100 border-0 h-5 min-w-[20px] px-1.5">
                {notifications.filter(n => n.category === 'system').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredNotifications.length === 0 ? (
              <Card className="border-2 border-dashed border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-900 p-16 text-center shadow-lg">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border-4 border-orange-200 dark:border-orange-800">
                      <BellOff className="h-12 w-12 text-orange-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 max-w-md font-medium">
                      {filter === 'unread' 
                        ? "You've read all your notifications. Great job staying on top of things!"
                        : activeTab === 'all'
                        ? "You don't have any notifications yet. Check back later for updates."
                        : `No ${activeTab} notifications at the moment.`
                      }
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type, notification.category);
                  const isUnread = !notification.read;
                  
                  return (
                    <Card
                      key={notification.id}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2",
                        isUnread 
                          ? `border-l-[6px] ${getNotificationBorderColor(notification.type)} bg-orange-50 dark:bg-orange-950/30 shadow-md border-orange-200 dark:border-orange-800`
                          : "border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-gray-900"
                      )}
                    >

                      <div className="flex items-start gap-4 p-5 relative">
                        {/* Icon with enhanced styling */}
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 transition-transform group-hover:scale-110",
                          getNotificationColor(notification.type)
                        )}>
                          <Icon className="h-7 w-7" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Title with unread indicator */}
                              <div className="flex items-center gap-2 mb-1">
                                {isUnread && (
                                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
                                )}
                                <h3 className={cn(
                                  "font-bold text-gray-900 dark:text-white text-lg",
                                  isUnread && "text-orange-900 dark:text-orange-100"
                                )}>
                                  {notification.title}
                                </h3>
                              </div>
                              
                              {/* Message */}
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
                                {notification.message}
                              </p>
                              
                              {/* Meta information */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs font-semibold border-2 px-2.5",
                                    notification.category === 'appointments' && "border-blue-300 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                                    notification.category === 'users' && "border-purple-300 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
                                    notification.category === 'messages' && "border-green-300 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
                                    notification.category === 'system' && "border-gray-300 text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
                                  )}
                                >
                                  {notification.category}
                                </Badge>
                                {notification.type !== 'info' && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs font-semibold border-2 px-2.5",
                                      notification.type === 'success' && "border-emerald-300 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                                      notification.type === 'warning' && "border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
                                      notification.type === 'error' && "border-rose-300 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20"
                                    )}
                                  >
                                    {notification.type}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isUnread && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                title="Delete notification"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Action button */}
                          {notification.actionUrl && (
                            <Link href={notification.actionUrl} className="inline-block">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                  if (!notification.read) {
                                    markAsRead(notification.id);
                                  }
                                }}
                                className="mt-3 p-0 h-auto text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold group/btn flex items-center gap-1.5"
                              >
                                <span>View Details</span>
                                <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Bottom accent line for unread */}
                      {isUnread && (
                        <div className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
}
