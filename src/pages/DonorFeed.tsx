import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Droplets, MapPin, Clock, AlertTriangle, Send, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import SkeletonLoader from "@/components/premium/SkeletonLoader";

const urgencyColors: Record<string, string> = {
  critical: "bg-critical text-critical-foreground",
  urgent: "bg-urgent text-urgent-foreground",
  normal: "bg-success text-success-foreground",
};

export default function DonorFeedPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("status", "active")
      .order("urgency", { ascending: true })
      .order("created_at", { ascending: false });
    setRequests((data as any[]) || []);
    setLoading(false);
  };

  const handleRespond = async (requestId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("donor_responses").insert({
        request_id: requestId,
        donor_id: user.id,
        message: message || null,
      } as any);
      if (error) {
        if (error.code === "23505") toast.error("You've already responded to this request");
        else throw error;
      } else {
        toast.success("Response sent! The patient will be notified.");
      }
      setRespondingTo(null);
      setMessage("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageTransition><SkeletonLoader lines={5} className="mt-8" /></PageTransition>;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <GradientHeading subtitle="Active blood requests near you">Donor Feed</GradientHeading>
        <Link to="/donor-details">
          <GlowButton variant="secondary" size="sm">
            <UserPlus className="w-4 h-4 mr-1" /> My Donor Details
          </GlowButton>
        </Link>
      </div>

      {requests.length === 0 ? (
        <GlassCard className="p-4">
          <EmptyState icon={Droplets} title="No active requests" description="Check back soon for new requests!" />
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard
                glow={req.urgency === "critical"}
                className={`p-6 space-y-4 ${req.urgency === "critical" ? "border-critical/30 shadow-[0_0_20px_hsl(var(--critical)_/_0.1)]" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm border border-primary/20">
                      {req.blood_group}
                    </div>
                    <div>
                      <h3 className="text-base font-display text-foreground">{req.patient_name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {req.hospital_name}
                      </p>
                    </div>
                  </div>
                  <Badge className={urgencyColors[req.urgency]}>
                    {req.urgency === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {req.urgency}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-border/50 text-muted-foreground">{req.donation_type.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="border-border/50 text-muted-foreground">{req.units_needed} unit(s)</Badge>
                  {req.city && <Badge variant="outline" className="border-border/50 text-muted-foreground"><MapPin className="w-3 h-3 mr-1" />{req.city}</Badge>}
                  <Badge variant="outline" className="border-border/50 text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(req.expires_at), { addSuffix: true })}
                  </Badge>
                </div>

                {req.notes && <p className="text-sm text-muted-foreground">{req.notes}</p>}

                {respondingTo === req.id ? (
                  <div className="space-y-3 pt-3 border-t border-border/30">
                    <PremiumInput
                      placeholder="Optional message to patient..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <GlowButton size="sm" onClick={() => handleRespond(req.id)} className="flex-1">
                        <Send className="w-3 h-3 mr-1" /> Send Response
                      </GlowButton>
                      <GlowButton variant="secondary" size="sm" onClick={() => setRespondingTo(null)}>Cancel</GlowButton>
                    </div>
                  </div>
                ) : (
                  <GlowButton variant="secondary" size="sm" className="w-full" onClick={() => setRespondingTo(req.id)}>
                    I want to donate
                  </GlowButton>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
