import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, Droplets, Clock, PlusCircle, Activity, Users, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import StatsCard from "@/components/premium/StatsCard";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import EmptyState from "@/components/premium/EmptyState";

const urgencyColors: Record<string, string> = {
  critical: "bg-critical text-critical-foreground",
  urgent: "bg-urgent text-urgent-foreground",
  normal: "bg-success text-success-foreground",
};

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, fulfilled: 0, responses: 0 });

  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const { data: requests } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5);
    setActiveRequests((requests as any[]) || []);

    if (profile?.role === "patient") {
      const { count: total } = await supabase.from("blood_requests").select("*", { count: "exact", head: true }).eq("patient_id", user.id);
      const { count: fulfilled } = await supabase.from("blood_requests").select("*", { count: "exact", head: true }).eq("patient_id", user.id).eq("status", "fulfilled");
      setStats({ total: total || 0, fulfilled: fulfilled || 0, responses: 0 });
    } else {
      const { count: responses } = await supabase.from("donor_responses").select("*", { count: "exact", head: true }).eq("donor_id", user.id);
      setStats({ total: 0, fulfilled: 0, responses: responses || 0 });
    }
  };

  return (
    <PageTransition className="space-y-6">
      <GradientHeading
        subtitle={profile?.role === "patient" ? "Manage your blood requests and health" : "Find nearby patients who need your help"}
      >
        Welcome, {profile?.full_name || "there"}
      </GradientHeading>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profile?.role === "patient" ? (
          <>
            <StatsCard icon={Activity} label="Total Requests" value={stats.total} accentColor="red" delay={0} />
            <StatsCard icon={Heart} label="Fulfilled" value={stats.fulfilled} accentColor="mint" delay={0.05} />
            <StatsCard icon={Droplets} label="Blood Group" value={profile?.blood_group || "—"} accentColor="violet" delay={0.1} />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-5 flex items-center justify-center"
            >
              <Link to="/create-request">
                <GlowButton size="sm">
                  <PlusCircle className="w-4 h-4 mr-1" /> New Request
                </GlowButton>
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            <StatsCard icon={Users} label="Donations" value={profile?.donation_count || 0} accentColor="red" delay={0} />
            <StatsCard icon={Activity} label="Score" value={profile?.donor_score || 0} accentColor="mint" delay={0.05} />
            <StatsCard icon={Droplets} label="Blood Group" value={profile?.blood_group || "—"} accentColor="violet" delay={0.1} />
            <StatsCard icon={Heart} label="Status" value={profile?.is_available ? "Available" : "Unavailable"} accentColor={profile?.is_available ? "success" : "warning"} delay={0.15} />
          </>
        )}
      </div>

      {/* Active requests */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-display text-foreground">Active Blood Requests</h2>
          {profile?.role === "donor" && (
            <Link to="/donor-feed">
              <GlowButton variant="secondary" size="sm">View All</GlowButton>
            </Link>
          )}
        </div>
        <div className="px-6 pb-6">
          {activeRequests.length === 0 ? (
            <EmptyState icon={Droplets} title="No active requests" description="Check back soon for new blood requests" />
          ) : (
            <div className="space-y-3">
              {activeRequests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl glass hover:bg-[hsl(var(--glass)_/_0.06)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm border border-primary/20">
                      {req.blood_group}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{req.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{req.hospital_name} • {req.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={urgencyColors[req.urgency]}>
                      {req.urgency === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {req.urgency}
                    </Badge>
                    <Badge variant="outline" className="border-border/50 text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {req.donation_type.replace("_", " ")}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </PageTransition>
  );
}
