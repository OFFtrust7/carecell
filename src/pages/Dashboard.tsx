import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Droplets, Clock, PlusCircle, Activity, Users, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-display text-foreground">
          Welcome, {profile?.full_name || "there"}
        </h1>
        <p className="text-muted-foreground">
          {profile?.role === "patient" ? "Manage your blood requests and health" : "Find nearby patients who need your help"}
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profile?.role === "patient" ? (
          <>
            <StatCard icon={Activity} label="Total Requests" value={stats.total} />
            <StatCard icon={Heart} label="Fulfilled" value={stats.fulfilled} />
            <StatCard icon={Droplets} label="Blood Group" value={profile?.blood_group || "—"} />
            <Card className="flex flex-col items-center justify-center p-4">
              <Link to="/create-request">
                <Button size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" /> New Request
                </Button>
              </Link>
            </Card>
          </>
        ) : (
          <>
            <StatCard icon={Users} label="Donations" value={profile?.donation_count || 0} />
            <StatCard icon={Activity} label="Score" value={profile?.donor_score || 0} />
            <StatCard icon={Droplets} label="Blood Group" value={profile?.blood_group || "—"} />
            <StatCard icon={Heart} label="Status" value={profile?.is_available ? "Available" : "Unavailable"} />
          </>
        )}
      </div>

      {/* Active requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl">Active Blood Requests</CardTitle>
          {profile?.role === "donor" && (
            <Link to="/donor-feed">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active requests right now</p>
          ) : (
            <div className="space-y-3">
              {activeRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {req.blood_group}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{req.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{req.hospital_name} • {req.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={urgencyColors[req.urgency]}>
                      {req.urgency === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {req.urgency}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {req.donation_type.replace("_", " ")}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold font-display">{value}</p>
        </div>
      </div>
    </Card>
  );
}
