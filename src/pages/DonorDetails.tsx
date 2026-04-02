import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";

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
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/donor-feed")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Donor Feed
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Donor Details</CardTitle>
          <CardDescription>Enter your details so patients can find the right match</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Blood Group *</Label>
                <Select value={form.blood_group} onValueChange={(v) => update("blood_group", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>PIN Code</Label>
                <Input value={form.pin_code} onChange={(e) => update("pin_code", e.target.value)} />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Available for Donation</p>
                  <p className="text-xs text-muted-foreground">Toggle off to pause receiving requests</p>
                </div>
                <Switch checked={form.is_available} onCheckedChange={(v) => update("is_available", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Platelet Donor</p>
                  <p className="text-xs text-muted-foreground">Available for platelet donation</p>
                </div>
                <Switch checked={form.platelet_donor} onCheckedChange={(v) => update("platelet_donor", v)} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.full_name || !form.blood_group}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Donor Details"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
