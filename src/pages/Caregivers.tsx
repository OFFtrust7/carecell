import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Users, Trash2, Copy, Check } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function CaregiversPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [form, setForm] = useState({ caregiver_email: "", relationship: "", access_scope: "view" });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("caregiver_links" as any)
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });
    setLinks((data as any[]) || []);
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("caregiver_links" as any).insert({
      patient_id: user.id,
      caregiver_email: form.caregiver_email,
      relationship: form.relationship || null,
      access_scope: form.access_scope,
    } as any);
    if (error) return toast.error(error.code === "23505" ? "Already invited" : error.message);
    toast.success("Invite created — share the code below");
    setForm({ caregiver_email: "", relationship: "", access_scope: "view" });
    load();
  };

  const revoke = async (id: string) => {
    await supabase.from("caregiver_links" as any).update({ status: "revoked" } as any).eq("id", id);
    toast.success("Access revoked");
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Invite family members to view your medical records and treatment timeline.">
        Caregivers & Family
      </GradientHeading>

      <GlassCard className="p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Invite a caregiver
        </h3>
        <form onSubmit={invite} className="space-y-4">
          <PremiumInput label="Caregiver Email *" type="email" value={form.caregiver_email}
            onChange={(e) => setForm({ ...form, caregiver_email: e.target.value })} required />
          <div className="grid md:grid-cols-2 gap-4">
            <PremiumInput label="Relationship" value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              placeholder="e.g. Spouse, Parent" />
            <div>
              <label className="text-sm font-medium mb-2 block">Access</label>
              <Select value={form.access_scope} onValueChange={(v) => setForm({ ...form, access_scope: v })}>
                <SelectTrigger className="glass border-border rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-strong border-border/50">
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="view_edit">View + add records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <GlowButton type="submit" className="w-full">Send Invite</GlowButton>
        </form>
      </GlassCard>

      <div>
        <h3 className="font-display text-lg text-foreground mb-3">Linked Caregivers</h3>
        {links.length === 0 ? (
          <GlassCard className="p-4">
            <EmptyState icon={Users} title="No caregivers yet" description="Invite a trusted family member or friend." />
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {links.map((l) => (
              <GlassCard key={l.id} className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{l.caregiver_email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {l.relationship && <Badge variant="outline" className="text-[10px] border-border/50">{l.relationship}</Badge>}
                      <Badge variant="outline" className="text-[10px] border-border/50">
                        {l.access_scope === "view_edit" ? "View + Edit" : "View only"}
                      </Badge>
                      <Badge className={
                        l.status === "active" ? "bg-success text-success-foreground text-[10px]" :
                        l.status === "pending" ? "bg-urgent text-urgent-foreground text-[10px]" :
                        "bg-muted text-muted-foreground text-[10px]"
                      }>{l.status}</Badge>
                    </div>
                    {l.status === "pending" && l.invite_code && (
                      <button onClick={() => copyCode(l.invite_code)}
                        className="mt-2 inline-flex items-center gap-2 text-xs text-primary hover:underline">
                        Invite code: <code className="font-mono">{l.invite_code}</code>
                        {copied === l.invite_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  {l.status !== "revoked" && (
                    <button onClick={() => revoke(l.id)} className="p-2 rounded-lg text-muted-foreground hover:text-critical hover:bg-critical/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
