import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Droplets, MapPin, Clock, AlertTriangle, Send, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

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
    // Poll every 30s since realtime is disabled for security
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
        if (error.code === "23505") {
          toast.error("You've already responded to this request");
        } else throw error;
      } else {
        toast.success("Response sent! The patient will be notified.");
      }
      setRespondingTo(null);
      setMessage("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-foreground">Donor Feed</h1>
        <p className="text-muted-foreground">Active blood requests near you</p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No active requests right now. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`overflow-hidden ${req.urgency === "critical" ? "ring-2 ring-critical/50" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {req.blood_group}
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">{req.patient_name}</CardTitle>
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
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{req.donation_type.replace("_", " ")}</Badge>
                    <Badge variant="outline">{req.units_needed} unit(s)</Badge>
                    {req.city && <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />{req.city}</Badge>}
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(req.expires_at), { addSuffix: true })}
                    </Badge>
                  </div>
                  {req.notes && <p className="text-sm text-muted-foreground">{req.notes}</p>}

                  {respondingTo === req.id ? (
                    <div className="space-y-2 pt-2 border-t">
                      <Input placeholder="Optional message to patient..." value={message} onChange={(e) => setMessage(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRespond(req.id)} className="flex-1">
                          <Send className="w-3 h-3 mr-1" /> Send Response
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRespondingTo(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setRespondingTo(req.id)}>
                      I want to donate
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
