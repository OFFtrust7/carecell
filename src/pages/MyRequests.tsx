import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import EmptyState from "@/components/premium/EmptyState";

const statusColors: Record<string, string> = {
  active: "bg-success text-success-foreground",
  fulfilled: "bg-primary text-primary-foreground",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const urgencyColors: Record<string, string> = {
  critical: "bg-critical text-critical-foreground",
  urgent: "bg-urgent text-urgent-foreground",
  normal: "bg-success text-success-foreground",
};

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchRequests(); }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from("blood_requests").select("*").eq("patient_id", user.id).order("created_at", { ascending: false });
    setRequests((data as any[]) || []);
    if (data && data.length > 0) {
      const ids = data.map((r: any) => r.id);
      const { data: resps } = await supabase.from("donor_responses").select("*, profiles:donor_id(full_name, blood_group, phone)").in("request_id", ids);
      const grouped: Record<string, any[]> = {};
      (resps as any[] || []).forEach((r) => { if (!grouped[r.request_id]) grouped[r.request_id] = []; grouped[r.request_id].push(r); });
      setResponses(grouped);
    }
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("blood_requests").update({ status: "cancelled" } as any).eq("id", id);
    if (error) toast.error("Failed to cancel");
    else { toast.success("Request cancelled"); fetchRequests(); }
  };

  const handleConfirmDonor = async (responseId: string, requestId: string) => {
    await supabase.from("donor_responses").update({ status: "confirmed" } as any).eq("id", responseId);
    await supabase.from("blood_requests").update({ status: "fulfilled", fulfilled_at: new Date().toISOString() } as any).eq("id", requestId);
    toast.success("Donor confirmed! Request fulfilled.");
    fetchRequests();
  };

  if (loading) return <PageTransition><p className="text-center py-12 text-muted-foreground">Loading...</p></PageTransition>;

  const active = requests.filter((r) => r.status === "active");
  const past = requests.filter((r) => r.status !== "active");

  return (
    <PageTransition className="space-y-6">
      <GradientHeading>My Requests</GradientHeading>

      <Tabs defaultValue="active">
        <TabsList className="glass border-border/50">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {active.length === 0 ? (
            <EmptyState icon={Clock} title="No active requests" />
          ) : active.map((req) => (
            <RequestCard key={req.id} req={req} responses={responses[req.id] || []} onCancel={handleCancel} onConfirm={handleConfirmDonor} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-4">
          {past.length === 0 ? (
            <EmptyState icon={Clock} title="No past requests" />
          ) : past.map((req) => (
            <RequestCard key={req.id} req={req} responses={responses[req.id] || []} onCancel={handleCancel} onConfirm={handleConfirmDonor} />
          ))}
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}

function RequestCard({ req, responses, onCancel, onConfirm }: { req: any; responses: any[]; onCancel: (id: string) => void; onConfirm: (responseId: string, requestId: string) => void }) {
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-lg text-foreground">{req.blood_group} — {req.donation_type.replace("_", " ")}</h3>
          <p className="text-sm text-muted-foreground">{req.hospital_name} • {req.city}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={urgencyColors[req.urgency]}>
            {req.urgency === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
            {req.urgency}
          </Badge>
          <Badge className={statusColors[req.status]}>{req.status}</Badge>
        </div>
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        Created {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
      </div>

      {responses.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-border/30">
          <p className="text-sm font-medium text-foreground">{responses.length} Donor Response(s)</p>
          {responses.map((resp) => (
            <div key={resp.id} className="flex items-center justify-between p-3 rounded-xl glass">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{resp.profiles?.full_name || "Donor"}</p>
                  {resp.message && <p className="text-xs text-muted-foreground">{resp.message}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resp.status === "offered" && req.status === "active" ? (
                  <GlowButton size="sm" onClick={() => onConfirm(resp.id, req.request_id || req.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Confirm
                  </GlowButton>
                ) : (
                  <Badge variant="outline" className="border-border/50 text-muted-foreground">{resp.status}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {req.status === "active" && (
        <GlowButton variant="danger" size="sm" onClick={() => onCancel(req.id)}>
          <XCircle className="w-3 h-3 mr-1" /> Cancel Request
        </GlowButton>
      )}
    </GlassCard>
  );
}
