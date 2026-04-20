import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  active: "bg-success text-success-foreground",
  fulfilled: "bg-primary text-primary-foreground",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function RequestStatusTimeline({ requestId }: { requestId: string }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("request_status_history" as any)
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });
      setHistory((data as any[]) || []);
    })();
  }, [requestId]);

  if (history.length === 0) return null;

  return (
    <div className="space-y-2 pt-3 border-t border-border/30">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" /> Status timeline
      </p>
      <div className="space-y-1.5">
        {history.map((h) => (
          <div key={h.id} className="flex items-center gap-2 text-xs">
            <Badge className={`${statusColor[h.new_status] || "bg-muted text-muted-foreground"} text-[10px]`}>
              {h.new_status}
            </Badge>
            {h.note && <span className="text-muted-foreground">— {h.note}</span>}
            <span className="text-muted-foreground/70 ml-auto">
              {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
