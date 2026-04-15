import { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass)_/_0.05)] transition-all">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-r from-glow-violet to-glow-mint text-white text-[10px] flex items-center justify-center font-bold shadow-[0_0_12px_hsl(var(--glow-violet)_/_0.4)]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-strong border-border/50 rounded-2xl overflow-hidden" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <p className="font-display font-semibold text-sm text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No notifications yet</p>
          ) : (
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.type === "donor_response") setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-border/30 last:border-0 transition-all hover:bg-[hsl(var(--glass)_/_0.05)] ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-glow-violet to-glow-mint flex-shrink-0 shadow-[0_0_8px_hsl(var(--glow-violet)_/_0.4)]" />
                    )}
                    <div className={!n.is_read ? "" : "ml-4"}>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
        {notifications.length > 0 && notifications[0].type === "donor_response" && (
          <div className="border-t border-border/50 px-4 py-2.5">
            <Link to="/my-requests" onClick={() => setOpen(false)} className="text-xs text-accent hover:underline">
              View My Requests →
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
