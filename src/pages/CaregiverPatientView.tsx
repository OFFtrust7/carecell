import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, FileText, Activity, Sparkles, Loader2 } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import EmptyState from "@/components/premium/EmptyState";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CaregiverPatientViewPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => { if (patientId) load(); }, [patientId]);

  const load = async () => {
    if (!patientId) return;
    const [{ data: prof }, { data: d }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", patientId).maybeSingle(),
      supabase.from("medical_documents").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
      supabase.from("treatment_events").select("*").eq("patient_id", patientId).order("event_date", { ascending: false }),
    ]);
    setProfile(prof);
    setDocs((d as any[]) || []);
    setEvents((e as any[]) || []);
  };

  const generateSummary = async () => {
    setSummarizing(true);
    setSummary("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-summary", {
        body: {
          patient: { full_name: profile?.full_name, cancer_type: profile?.cancer_type, cancer_stage: profile?.cancer_stage, blood_group: profile?.blood_group, allergies: profile?.allergies },
          events: events.slice(0, 20).map((e) => ({ title: e.title, type: e.event_type, date: e.event_date, status: e.status })),
          documents: docs.slice(0, 20).map((d) => ({ title: d.title, type: d.doc_type, date: d.document_date })),
        },
      });
      if (error) throw error;
      setSummary((data as any)?.summary || "No summary generated.");
    } catch (e: any) {
      toast.error(e.message || "Could not generate summary");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <Link to="/caregiver" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <GradientHeading subtitle={[profile?.cancer_type, profile?.city].filter(Boolean).join(" • ") || "Patient overview"}>
        {profile?.full_name || "Patient"}
      </GradientHeading>

      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-display text-lg text-foreground">AI overview</h3>
          </div>
          <GlowButton size="sm" onClick={generateSummary} disabled={summarizing}>
            {summarizing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating</> : "Generate summary"}
          </GlowButton>
        </div>
        {summary ? (
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Get an AI-generated summary of this patient's recent timeline and documents.</p>
        )}
      </GlassCard>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Treatment Timeline
          </h3>
          {events.length === 0 ? (
            <GlassCard className="p-4"><EmptyState icon={Activity} title="No events yet" /></GlassCard>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 10).map((ev) => (
                <GlassCard key={ev.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ev.event_date), "MMM d, yyyy")} • {ev.event_type}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/50">{ev.status}</Badge>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Medical Documents
          </h3>
          {docs.length === 0 ? (
            <GlassCard className="p-4"><EmptyState icon={FileText} title="No documents yet" /></GlassCard>
          ) : (
            <div className="space-y-2">
              {docs.slice(0, 10).map((d) => (
                <GlassCard key={d.id} className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.doc_type}
                    {d.document_date && ` • ${format(new Date(d.document_date), "MMM d, yyyy")}`}
                  </p>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
