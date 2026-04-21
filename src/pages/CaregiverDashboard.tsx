import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Users, FileText, Activity, ChevronRight, Eye, Edit3 } from "lucide-react";
import { format } from "date-fns";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import EmptyState from "@/components/premium/EmptyState";
import { Badge } from "@/components/ui/badge";

interface Link {
  id: string;
  patient_id: string;
  access_scope: string;
  accepted_at: string | null;
  relationship: string | null;
}

interface PatientCard {
  link: Link;
  patient_name: string;
  city: string | null;
  cancer_type: string | null;
  doc_count: number;
  next_event: { title: string; event_date: string } | null;
}

export default function CaregiverDashboardPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<PatientCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: links } = await supabase
      .from("caregiver_links")
      .select("id,patient_id,access_scope,accepted_at,relationship,status")
      .eq("caregiver_id", user.id)
      .eq("status", "active");
    const list = (links as any[]) || [];

    const enriched: PatientCard[] = await Promise.all(
      list.map(async (l) => {
        const [{ data: prof }, { count: docCount }, { data: events }] = await Promise.all([
          supabase.from("profiles").select("full_name,city,cancer_type").eq("user_id", l.patient_id).maybeSingle(),
          supabase.from("medical_documents").select("id", { count: "exact", head: true }).eq("patient_id", l.patient_id),
          supabase
            .from("treatment_events")
            .select("title,event_date")
            .eq("patient_id", l.patient_id)
            .gte("event_date", new Date().toISOString().slice(0, 10))
            .order("event_date", { ascending: true })
            .limit(1),
        ]);
        return {
          link: l,
          patient_name: (prof as any)?.full_name || "Patient",
          city: (prof as any)?.city || null,
          cancer_type: (prof as any)?.cancer_type || null,
          doc_count: docCount || 0,
          next_event: (events as any[])?.[0] || null,
        };
      })
    );
    setCards(enriched);
    setLoading(false);
  };

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Loved ones who've granted you access.">
        Caregiver Dashboard
      </GradientHeading>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : cards.length === 0 ? (
        <GlassCard className="p-6">
          <EmptyState
            icon={Users}
            title="No linked patients yet"
            description="Once a patient invites you and you accept their code, they'll appear here."
          />
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map((c) => (
            <GlassCard key={c.link.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg text-foreground truncate">{c.patient_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[c.cancer_type, c.city].filter(Boolean).join(" • ") || "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {c.link.relationship && (
                      <Badge variant="outline" className="text-[10px] border-border/50">{c.link.relationship}</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] border-border/50">
                      {c.link.access_scope === "view_edit" ? (
                        <><Edit3 className="w-3 h-3 mr-1" /> View + Edit</>
                      ) : (
                        <><Eye className="w-3 h-3 mr-1" /> View only</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[hsl(var(--glass)_/_0.04)] border border-border/30 p-2.5">
                  <div className="text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> Documents</div>
                  <div className="text-foreground font-medium mt-0.5">{c.doc_count}</div>
                </div>
                <div className="rounded-xl bg-[hsl(var(--glass)_/_0.04)] border border-border/30 p-2.5">
                  <div className="text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> Next event</div>
                  <div className="text-foreground font-medium mt-0.5 truncate">
                    {c.next_event ? `${c.next_event.title} · ${format(new Date(c.next_event.event_date), "MMM d")}` : "None"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/caregiver/patient/${c.link.patient_id}`}
                  className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Open patient view <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
