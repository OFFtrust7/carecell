import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Droplets, MapPin, Award, Calendar, CheckCircle2 } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorMatchingPage() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return toast.error("Pick a blood group");
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase.rpc("match_donors" as any, {
      p_blood_group: bloodGroup,
      p_city: city || null,
      p_limit: 30,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setResults((data as any[]) || []);
  };

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Find ranked donors by blood group, location, availability and eligibility.">
        Donor Matching
      </GradientHeading>

      <GlassCard className="p-6">
        <form onSubmit={search} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="text-sm font-medium mb-2 block">Blood Group *</label>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger className="glass border-border rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="glass-strong border-border/50">
                {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <PremiumInput label="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} />
          <GlowButton type="submit" disabled={loading}>
            <Search className="w-4 h-4 mr-1" /> {loading ? "Matching..." : "Match"}
          </GlowButton>
        </form>
      </GlassCard>

      {searched && results.length === 0 && !loading && (
        <GlassCard className="p-4">
          <EmptyState icon={Droplets} title="No matching donors" description="Try widening your city filter or another blood group." />
        </GlassCard>
      )}

      {results.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((d) => {
            const eligibleNow = !d.next_eligible_date || new Date(d.next_eligible_date) <= new Date();
            return (
              <GlassCard key={d.user_id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {d.blood_group}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{d.full_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{[d.city, d.state].filter(Boolean).join(", ") || "—"}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {d.is_available && <Badge className="bg-success text-success-foreground text-[10px]">Available</Badge>}
                        {eligibleNow ? (
                          <Badge className="bg-mint text-background text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Eligible</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-border/50">
                            <Calendar className="w-3 h-3 mr-1" />
                            Next: {format(new Date(d.next_eligible_date), "MMM d")}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] border-border/50">
                          <Award className="w-3 h-3 mr-1" />Score {d.match_score}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
