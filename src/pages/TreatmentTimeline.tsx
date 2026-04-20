import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Activity, Pill, Stethoscope, FlaskConical, Calendar, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  chemo_cycle:       { icon: Activity,     color: "text-violet",  label: "Chemo Cycle" },
  surgery:           { icon: Stethoscope,  color: "text-primary", label: "Surgery" },
  lab_test:          { icon: FlaskConical, color: "text-mint",    label: "Lab Test" },
  follow_up:         { icon: Calendar,     color: "text-mint",    label: "Follow-up" },
  medication:        { icon: Pill,         color: "text-violet",  label: "Medication" },
  milestone:         { icon: CheckCircle2, color: "text-mint",    label: "Milestone" },
  other:             { icon: Activity,     color: "text-muted-foreground", label: "Other" },
};

export default function TreatmentTimelinePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    event_type: "chemo_cycle",
    title: "",
    description: "",
    event_date: new Date().toISOString().slice(0, 10),
    doctor_name: "",
    hospital_name: "",
    status: "planned",
  });

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("treatment_events" as any)
      .select("*")
      .eq("patient_id", user.id)
      .order("event_date", { ascending: false });
    setEvents((data as any[]) || []);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("treatment_events" as any).insert({
      ...form,
      patient_id: user.id,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Event added to timeline");
    setOpen(false);
    setForm({ ...form, title: "", description: "", doctor_name: "", hospital_name: "" });
    load();
  };

  const markCompleted = async (id: string) => {
    await supabase.from("treatment_events" as any).update({ status: "completed" } as any).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("treatment_events" as any).delete().eq("id", id);
    load();
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <GradientHeading subtitle="Track every cycle, test, and milestone of your care">
          Treatment Timeline
        </GradientHeading>
        <GlowButton size="sm" onClick={() => setOpen((v) => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Add Event
        </GlowButton>
      </div>

      {open && (
        <GlassCard className="p-6">
          <form onSubmit={save} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger className="glass border-border rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-strong border-border/50">
                    {Object.entries(TYPE_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <PremiumInput label="Date" type="date" value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
            </div>
            <PremiumInput label="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <PremiumInput label="Notes (optional)" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid md:grid-cols-2 gap-4">
              <PremiumInput label="Doctor" value={form.doctor_name}
                onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} />
              <PremiumInput label="Hospital" value={form.hospital_name}
                onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <GlowButton type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</GlowButton>
              <GlowButton type="submit" size="sm">Save</GlowButton>
            </div>
          </form>
        </GlassCard>
      )}

      {events.length === 0 ? (
        <GlassCard className="p-4">
          <EmptyState icon={Activity} title="Your timeline is empty" description="Add your first treatment event to start tracking." />
        </GlassCard>
      ) : (
        <div className="relative space-y-4 pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {events.map((ev, i) => {
            const meta = TYPE_META[ev.event_type] || TYPE_META.other;
            const Icon = meta.icon;
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative"
              >
                <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--glow-red)_/_0.5)]" />
                <GlassCard className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{ev.title}</p>
                          <Badge variant="outline" className="text-[10px] border-border/50">
                            {meta.label}
                          </Badge>
                          <Badge className={
                            ev.status === "completed" ? "bg-success text-success-foreground text-[10px]" :
                            ev.status === "missed" ? "bg-critical text-critical-foreground text-[10px]" :
                            "bg-muted text-muted-foreground text-[10px]"
                          }>{ev.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(ev.event_date), "MMM d, yyyy")}
                          {ev.doctor_name && ` • Dr. ${ev.doctor_name}`}
                          {ev.hospital_name && ` • ${ev.hospital_name}`}
                        </p>
                        {ev.description && <p className="text-sm text-muted-foreground mt-2">{ev.description}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {ev.status !== "completed" && (
                        <button onClick={() => markCompleted(ev.id)} className="p-1.5 rounded-lg text-mint hover:bg-mint/10" title="Mark completed">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => remove(ev.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-critical hover:bg-critical/10" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
