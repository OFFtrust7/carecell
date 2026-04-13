import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { addHours } from "date-fns";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_CONFIG = {
  critical: { hours: 6, label: "Critical (6h)", icon: AlertTriangle, color: "text-critical" },
  urgent: { hours: 12, label: "Urgent (12h)", icon: Clock, color: "text-urgent" },
  normal: { hours: 24, label: "Normal (24h)", icon: CheckCircle, color: "text-success" },
};

export default function CreateRequestPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    blood_group: profile?.blood_group || "", donation_type: "whole_blood",
    units_needed: "1", urgency: "normal",
    hospital_name: profile?.hospital_name || "", hospital_address: "",
    city: profile?.city || "", state: profile?.state || "",
    contact_phone: profile?.phone || "", notes: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    const urgencyHours = URGENCY_CONFIG[form.urgency as keyof typeof URGENCY_CONFIG].hours;
    const expiresAt = addHours(new Date(), urgencyHours).toISOString();

    try {
      const { error } = await supabase.from("blood_requests").insert({
        patient_id: user.id, patient_name: profile.full_name,
        blood_group: form.blood_group, donation_type: form.donation_type,
        units_needed: parseInt(form.units_needed), urgency: form.urgency,
        hospital_name: form.hospital_name, hospital_address: form.hospital_address,
        city: form.city, state: form.state, contact_phone: form.contact_phone,
        notes: form.notes, expires_at: expiresAt,
      } as any);
      if (error) throw error;
      toast.success("Blood request created!");
      navigate("/my-requests");
    } catch (err: any) {
      toast.error(err.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-2xl mx-auto">
      <GlassCard className="p-8">
        <GradientHeading as="h2" subtitle="Fill in the details to find matching donors nearby">
          Create Blood Request
        </GradientHeading>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Blood Group *</label>
              <Select value={form.blood_group} onValueChange={(v) => update("blood_group", v)}>
                <SelectTrigger className="glass border-border rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="glass-strong border-border/50">
                  {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <Select value={form.donation_type} onValueChange={(v) => update("donation_type", v)}>
                <SelectTrigger className="glass border-border rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-strong border-border/50">
                  <SelectItem value="whole_blood">Whole Blood</SelectItem>
                  <SelectItem value="platelets">Platelets</SelectItem>
                  <SelectItem value="plasma">Plasma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Urgency Level</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update("urgency", key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                      form.urgency === key
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--glow-violet)_/_0.15)]"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <span className="text-xs font-medium text-foreground">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Units Needed" type="number" min={1} max={10} value={form.units_needed} onChange={(e) => update("units_needed", e.target.value)} />
            <PremiumInput label="Contact Phone" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
          </div>

          <PremiumInput label="Hospital Name *" value={form.hospital_name} onChange={(e) => update("hospital_name", e.target.value)} required />
          <PremiumInput label="Hospital Address" value={form.hospital_address} onChange={(e) => update("hospital_address", e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <PremiumInput label="State" value={form.state} onChange={(e) => update("state", e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Additional Notes</label>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any special requirements..."
              className="glass border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <GlowButton type="submit" className="w-full" size="lg" disabled={loading || !form.blood_group || !form.hospital_name}>
            {loading ? "Creating..." : "Create Request"}
          </GlowButton>
        </form>
      </GlassCard>
    </PageTransition>
  );
}
