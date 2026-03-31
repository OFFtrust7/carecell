import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    blood_group: profile?.blood_group || "",
    gender: profile?.gender || "",
    city: profile?.city || "",
    state: profile?.state || "",
    pin_code: profile?.pin_code || "",
    is_available: profile?.is_available ?? true,
    platelet_donor: profile?.platelet_donor ?? false,
    cancer_type: profile?.cancer_type || "",
    cancer_stage: profile?.cancer_stage || "",
    hospital_name: profile?.hospital_name || "",
    doctor_name: profile?.doctor_name || "",
    allergies: profile?.allergies || "",
    emergency_contact_name: profile?.emergency_contact_name || "",
    emergency_contact_phone: profile?.emergency_contact_phone || "",
  });

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
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
          is_available: form.is_available,
          platelet_donor: form.platelet_donor,
          cancer_type: form.cancer_type || null,
          cancer_stage: form.cancer_stage || null,
          hospital_name: form.hospital_name || null,
          doctor_name: form.doctor_name || null,
          allergies: form.allergies || null,
          emergency_contact_name: form.emergency_contact_name || null,
          emergency_contact_phone: form.emergency_contact_phone || null,
        } as any)
        .eq("user_id", profile.user_id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-display text-foreground">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Blood Group</Label>
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
              <Label>PIN Code</Label>
              <Input value={form.pin_code} onChange={(e) => update("pin_code", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.role === "donor" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Donor Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Available for Donation</p>
                <p className="text-xs text-muted-foreground">Toggle off to pause receiving requests</p>
              </div>
              <Switch checked={form.is_available} onCheckedChange={(v) => update("is_available", v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Platelet Donor</p>
                <p className="text-xs text-muted-foreground">Available for platelet donation</p>
              </div>
              <Switch checked={form.platelet_donor} onCheckedChange={(v) => update("platelet_donor", v)} />
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role === "patient" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cancer Type</Label>
                <Input value={form.cancer_type} onChange={(e) => update("cancer_type", e.target.value)} placeholder="e.g., Breast Cancer" />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Input value={form.cancer_stage} onChange={(e) => update("cancer_stage", e.target.value)} placeholder="e.g., Stage II" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hospital</Label>
                <Input value={form.hospital_name} onChange={(e) => update("hospital_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Input value={form.doctor_name} onChange={(e) => update("doctor_name", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Textarea value={form.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder="List any known allergies" />
            </div>
            <Separator />
            <p className="text-sm font-medium">Emergency Contact</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={loading} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
