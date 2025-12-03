'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageCircle, Briefcase, MessageSquare, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNotifications, type NotificationType } from '@/hooks/use-notifications';
import type { Notification } from '@/lib/supabase';

const typeIcon: Record<NotificationType, JSX.Element> = {
  message: <MessageCircle className="h-4 w-4 text-[#1e3a5f]" />,
  job: <Briefcase className="h-4 w-4 text-[#1e3a5f]" />,
  comment: <MessageSquare className="h-4 w-4 text-[#1e3a5f]" />,
};

const typeLabel: Record<NotificationType, string> = {
  message: 'Message',
  job: 'Job',
  comment: 'Comment',
};

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative text-white hover:text-[#d4af37] hover:bg-[#2a4a6f] p-2 h-10 w-10"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#d4af37] ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-600 hover:text-[#1e3a5f]"
            onClick={markAllAsRead}
            disabled={!unreadCount}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">You&apos;re all caught up.</div>
            ) : (
              notifications.map((notification: Notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 focus:bg-gray-50',
                    !notification.read && 'bg-[#f7f9fb]'
                  )}
                  onSelect={(event) => {
                    event.preventDefault();
                    markAsRead(notification.id);
                  }}
                >
                  <div className="mt-1 rounded-full bg-[#e8eef6] p-2 shadow-inner">{typeIcon[notification.type]}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1e3a5f]">{notification.title}</p>
                      <span className="text-[10px] font-semibold uppercase text-[#d4af37]">{typeLabel[notification.type]}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{notification.body}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
