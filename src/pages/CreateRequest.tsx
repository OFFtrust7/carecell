import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { addHours } from "date-fns";

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
    blood_group: profile?.blood_group || "",
    donation_type: "whole_blood",
    units_needed: "1",
    urgency: "normal",
    hospital_name: profile?.hospital_name || "",
    hospital_address: "",
    city: profile?.city || "",
    state: profile?.state || "",
    contact_phone: profile?.phone || "",
    notes: "",
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
        patient_id: user.id,
        patient_name: profile.full_name,
        blood_group: form.blood_group,
        donation_type: form.donation_type,
        units_needed: parseInt(form.units_needed),
        urgency: form.urgency,
        hospital_name: form.hospital_name,
        hospital_address: form.hospital_address,
        city: form.city,
        state: form.state,
        contact_phone: form.contact_phone,
        notes: form.notes,
        expires_at: expiresAt,
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Create Blood Request</CardTitle>
          <CardDescription>Fill in the details to find matching donors nearby</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Type</Label>
                <Select value={form.donation_type} onValueChange={(v) => update("donation_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole_blood">Whole Blood</SelectItem>
                    <SelectItem value="platelets">Platelets</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Urgency Level</Label>
              <RadioGroup value={form.urgency} onValueChange={(v) => update("urgency", v)} className="grid grid-cols-3 gap-3">
                {Object.entries(URGENCY_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <label key={key} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.urgency === key ? "border-primary bg-primary/5" : "border-border"}`}>
                      <RadioGroupItem value={key} className="sr-only" />
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="text-xs font-medium">{config.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Units Needed</Label>
                <Input type="number" min="1" max="10" value={form.units_needed} onChange={(e) => update("units_needed", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hospital Name *</Label>
              <Input value={form.hospital_name} onChange={(e) => update("hospital_name", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Hospital Address</Label>
              <Input value={form.hospital_address} onChange={(e) => update("hospital_address", e.target.value)} />
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

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any special requirements..." />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.blood_group || !form.hospital_name}>
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
