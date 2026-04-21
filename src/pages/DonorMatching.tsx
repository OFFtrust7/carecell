import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Droplets, MapPin, Award, Calendar, CheckCircle2, Navigation, Crown, Zap, Shield } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const LABEL_STYLE: Record<string, { bg: string; icon: any; text: string }> = {
  "Top Match": { bg: "bg-mint/15 border-mint/40 text-mint", icon: Crown, text: "Top Match" },
  "Fastest Available": { bg: "bg-primary/15 border-primary/40 text-primary", icon: Zap, text: "Fastest" },
  "Backup": { bg: "bg-muted/40 border-border text-muted-foreground", icon: Shield, text: "Backup" },
};

export default function DonorMatchingPage() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Location not available");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success("Location set"); },
      () => toast.error("Could not get location")
    );
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return toast.error("Pick a blood group");
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase.rpc("match_donors_v2" as any, {
      p_blood_group: bloodGroup,
      p_city: city || null,
      p_lat: coords?.lat ?? null,
      p_lng: coords?.lng ?? null,
      p_emergency: emergency,
      p_limit: 30,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setResults((data as any[]) || []);
  };

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Weighted scoring by location, eligibility, activity & emergency preference.">
        Donor Matching
      </GradientHeading>

      <GlassCard className="p-6 space-y-4">
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

        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-3">
            <Switch id="emerg" checked={emergency} onCheckedChange={setEmergency} />
            <label htmlFor="emerg" className="text-sm text-foreground cursor-pointer">
              Prioritize emergency-ready donors
            </label>
          </div>
          <GlowButton variant="secondary" size="sm" type="button" onClick={useMyLocation}>
            <Navigation className="w-4 h-4 mr-1" />
            {coords ? "Location set ✓" : "Use my location"}
          </GlowButton>
        </div>
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
            const labelStyle = LABEL_STYLE[d.match_label] || LABEL_STYLE["Backup"];
            const LabelIcon = labelStyle.icon;
            return (
              <GlassCard key={d.user_id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${labelStyle.bg}`}>
                    <LabelIcon className="w-3 h-3" /> {labelStyle.text}
                  </div>
                  <Badge variant="outline" className="text-[10px] border-border/50">
                    <Award className="w-3 h-3 mr-1" /> {d.match_score}
                  </Badge>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {d.blood_group}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{d.full_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{[d.city, d.state].filter(Boolean).join(", ") || "—"}
                      {d.distance_km != null && ` • ${d.distance_km.toFixed(1)} km`}
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
                      {d.accepts_emergency_calls && (
                        <Badge variant="outline" className="text-[10px] border-critical/40 text-critical">SOS-ready</Badge>
                      )}
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
