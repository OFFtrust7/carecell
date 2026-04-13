import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorDetailsPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    blood_group: profile?.blood_group || "",
    gender: profile?.gender || "",
    city: profile?.city || "",
    state: profile?.state || "",
    pin_code: profile?.pin_code || "",
    date_of_birth: profile?.date_of_birth || "",
    is_available: profile?.is_available ?? true,
    platelet_donor: profile?.platelet_donor ?? false,
  });

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          phone: form.phone || null,
          blood_group: form.blood_group || null,
          gender: form.gender || null,
          city: form.city || null,
          state: form.state || null,
          pin_code: form.pin_code || null,
          date_of_birth: form.date_of_birth || null,
          is_available: form.is_available,
          platelet_donor: form.platelet_donor,
        } as any)
        .eq("user_id", profile.user_id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Donor details saved successfully!");
      navigate("/donor-feed");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-2xl mx-auto space-y-4">
      <GlowButton variant="ghost" size="sm" onClick={() => navigate("/donor-feed")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Donor Feed
      </GlowButton>

      <GlassCard className="p-8">
        <GradientHeading as="h2" subtitle="Enter your details so patients can find the right match">
          Donor Details
        </GradientHeading>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Full Name *" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
            <PremiumInput label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="text-sm font-medium text-foreground">Gender</label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger className="glass border-border rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="glass-strong border-border/50">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PremiumInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <PremiumInput label="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <PremiumInput label="State" value={form.state} onChange={(e) => update("state", e.target.value)} />
            <PremiumInput label="PIN Code" value={form.pin_code} onChange={(e) => update("pin_code", e.target.value)} />
          </div>

          <div className="h-px bg-border/30 my-2" />

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl glass">
              <div>
                <p className="font-medium text-sm text-foreground">Available for Donation</p>
                <p className="text-xs text-muted-foreground">Toggle off to pause receiving requests</p>
              </div>
              <Switch checked={form.is_available} onCheckedChange={(v) => update("is_available", v)} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl glass">
              <div>
                <p className="font-medium text-sm text-foreground">Platelet Donor</p>
                <p className="text-xs text-muted-foreground">Available for platelet donation</p>
              </div>
              <Switch checked={form.platelet_donor} onCheckedChange={(v) => update("platelet_donor", v)} />
            </div>
          </div>

          <GlowButton type="submit" className="w-full" size="lg" disabled={loading || !form.full_name || !form.blood_group}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Donor Details"}
          </GlowButton>
        </form>
      </GlassCard>
    </PageTransition>
  );
}
