import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Phone, Siren, CheckCircle2, X, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EmergencyPage() {
  const { user, profile } = useAuth();
  const [active, setActive] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    blood_group: "",
    reason: "",
    hospital_name: "",
    city: "",
    contact_phone: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Autofill from profile when it loads
  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        blood_group: f.blood_group || profile.blood_group || "",
        city: f.city || profile.city || "",
        contact_phone: f.contact_phone || profile.phone || "",
        latitude: f.latitude ?? profile.latitude,
        longitude: f.longitude ?? profile.longitude,
        hospital_name: f.hospital_name || profile.hospital_name || "",
      }));
    }
  }, [profile]);

  // Realtime subscribe + initial load
  useEffect(() => {
    load();
    const channel = supabase
      .channel("emergency-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const load = async () => {
    const { data } = await supabase.rpc("list_active_emergencies" as any);
    setActive((data as any[]) || []);
  };

  const callEmergency = async (id: string) => {
    const { data, error } = await supabase.rpc("get_emergency_contact" as any, { p_id: id });
    const row = (data as any[])?.[0];
    if (error || !row?.contact_phone) {
      toast.error("Contact not available — only matching donors and the patient can call");
      return;
    }
    window.location.href = `tel:${row.contact_phone}`;
  };

  const captureLocation = () =>
    new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 4000 }
      );
    });

  // ONE-TAP SOS — autofills from profile + best-effort live location, broadcasts in <3s
  const oneTapSOS = async () => {
    if (!user || !profile) return;
    if (!profile.blood_group || !profile.phone) {
      toast.error("Add blood group + phone to your profile first");
      setShowForm(true);
      return;
    }
    setSubmitting(true);
    const loc = await Promise.race([
      captureLocation(),
      new Promise<null>((r) => setTimeout(() => r(null), 2500)),
    ]);
    const payload = {
      patient_id: user.id,
      patient_name: profile.full_name || "Patient",
      blood_group: profile.blood_group,
      reason: "Urgent — needs blood now",
      city: profile.city,
      hospital_name: profile.hospital_name,
      contact_phone: profile.phone,
      latitude: loc?.lat ?? profile.latitude ?? null,
      longitude: loc?.lng ?? profile.longitude ?? null,
    };
    const { error } = await supabase.from("emergency_requests").insert(payload as any);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("🚨 SOS broadcast — donors are being notified");
    load();
  };

  const sendDetailedSOS = async () => {
    if (!user || !profile) return;
    if (!form.blood_group || !form.contact_phone || !form.reason) {
      return toast.error("Blood group, reason and phone are required");
    }
    setSubmitting(true);
    const { error } = await supabase.from("emergency_requests").insert({
      patient_id: user.id,
      patient_name: profile.full_name || "Patient",
      ...form,
    } as any);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("🚨 SOS broadcast — donors are being notified");
    setForm({ ...form, reason: "" });
    setShowForm(false);
    load();
  };

  const resolve = async (id: string) => {
    await supabase.from("emergency_requests")
      .update({ status: "resolved", resolved_at: new Date().toISOString() } as any)
      .eq("id", id);
    toast.success("Marked as resolved");
    load();
  };

  const isPatient = profile?.role === "patient";

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Live broadcast to nearby eligible donors. Use only for time-critical needs.">
        Emergency Mode
      </GradientHeading>

      {isPatient && (
        <GlassCard className="p-6 space-y-4 border-critical/40 shadow-[0_0_30px_hsl(var(--critical)_/_0.15)]">
          <div className="flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-12 h-12 rounded-2xl bg-critical/15 border border-critical/30 flex items-center justify-center">
              <Siren className="w-6 h-6 text-critical" />
            </motion.div>
            <div>
              <h2 className="font-display text-xl text-foreground">One-tap SOS</h2>
              <p className="text-xs text-muted-foreground">Autofills from your profile and broadcasts instantly</p>
            </div>
          </div>

          <GlowButton variant="danger" size="lg" onClick={oneTapSOS} disabled={submitting} className="w-full">
            <Zap className="w-5 h-5 mr-2" />
            {submitting ? "Broadcasting..." : "🚨 SEND SOS NOW"}
          </GlowButton>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showForm ? "Hide details" : "Add details (optional)"}
          </button>

          {showForm && (
            <div className="space-y-4 pt-2 border-t border-border/30">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Blood Group *</label>
                  <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
                    <SelectTrigger className="glass border-border rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="glass-strong border-border/50">
                      {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <PremiumInput label="Contact Phone *" value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              </div>

              <PremiumInput label="What's happening? *" value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. accident — needs 2 units urgently" />

              <div className="grid md:grid-cols-2 gap-4">
                <PremiumInput label="Hospital" value={form.hospital_name}
                  onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} />
                <PremiumInput label="City" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>

              <div className="flex gap-2 flex-wrap">
                <GlowButton variant="secondary" size="sm" onClick={async () => {
                  const loc = await captureLocation();
                  if (loc) { setForm((f) => ({ ...f, latitude: loc.lat, longitude: loc.lng })); toast.success("Location captured"); }
                  else toast.error("Could not get location");
                }}>
                  <MapPin className="w-4 h-4 mr-1" />
                  {form.latitude ? "Location captured ✓" : "Share My Location"}
                </GlowButton>
              </div>

              <GlowButton variant="danger" onClick={sendDetailedSOS} disabled={submitting} className="w-full">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {submitting ? "Broadcasting..." : "Broadcast detailed SOS"}
              </GlowButton>
            </div>
          )}
        </GlassCard>
      )}

      <div>
        <h3 className="font-display text-lg text-foreground mb-3">
          Active Emergencies {active.length > 0 && <span className="text-critical">({active.length})</span>}
        </h3>
        {active.length === 0 ? (
          <GlassCard className="p-4">
            <EmptyState icon={CheckCircle2} title="No active emergencies right now" />
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {active.map((sos) => (
              <GlassCard key={sos.id} className="p-4 border-critical/30">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-critical/15 border border-critical/30 flex items-center justify-center font-bold text-critical text-sm">
                      {sos.blood_group}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{sos.patient_name}</p>
                        <Badge className="bg-critical text-critical-foreground text-[10px]">SOS</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{sos.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sos.hospital_name && `${sos.hospital_name} • `}{sos.city && `${sos.city} • `}
                        {formatDistanceToNow(new Date(sos.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${sos.contact_phone}`}>
                      <GlowButton size="sm">
                        <Phone className="w-4 h-4 mr-1" /> Call
                      </GlowButton>
                    </a>
                    {sos.patient_id === user?.id && (
                      <GlowButton variant="secondary" size="sm" onClick={() => resolve(sos.id)}>
                        <X className="w-4 h-4 mr-1" /> Resolve
                      </GlowButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
