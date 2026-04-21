import { Bell, CheckCheck, Siren, Droplets, UserCheck, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import EmptyState from "@/components/premium/EmptyState";
import { useNotifications } from "@/hooks/useNotifications";

const ICONS: Record<string, any> = {
  emergency: Siren,
  donor_response: Droplets,
  request_status: MessageSquare,
  caregiver_accepted: UserCheck,
};

const LINK_FOR: Record<string, (refId: string | null) => string> = {
  emergency: () => "/emergency",
  donor_response: () => "/my-requests",
  request_status: () => "/my-requests",
  caregiver_accepted: () => "/caregivers",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <PageTransition className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <GradientHeading subtitle="Real-time alerts for SOS broadcasts, donor responses, and request updates.">
          Notifications
        </GradientHeading>
        {unreadCount > 0 && (
          <GlowButton variant="secondary" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </GlowButton>
        )}
      </div>

      {notifications.length === 0 ? (
        <GlassCard className="p-6">
          <EmptyState icon={Bell} title="You're all caught up" description="New alerts will appear here in real time." />
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = ICONS[n.type] || Bell;
            const href = LINK_FOR[n.type]?.(n.reference_id) || "#";
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link
                  to={href}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className="block"
                >
                  <GlassCard
                    className={`p-4 transition-all hover:bg-[hsl(var(--glass)_/_0.06)] ${
                      !n.is_read ? "border-primary/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                          n.type === "emergency"
                            ? "bg-critical/10 border-critical/30 text-critical"
                            : "bg-primary/10 border-primary/20 text-primary"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground truncate">{n.title}</p>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
