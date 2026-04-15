import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Clock, Search, Navigation, Hospital, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";

interface HospitalResult {
  name: string; vicinity: string; rating?: number; user_ratings_total?: number;
  opening_hours?: { open_now: boolean }; geometry: { location: { lat: number; lng: number } };
  place_id: string; types: string[]; distance?: number;
}

const INDIAN_CITIES = [
  { name: "Delhi", lat: 28.6139, lng: 77.209 }, { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 }, { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 }, { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 }, { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 }, { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
];

const SAMPLE_HOSPITALS: HospitalResult[] = [
  { name: "Tata Memorial Hospital", vicinity: "Dr. E Borges Road, Parel, Mumbai", rating: 4.5, user_ratings_total: 12500, opening_hours: { open_now: true }, geometry: { location: { lat: 19.0048, lng: 72.8426 } }, place_id: "tata", types: ["hospital"], distance: 2.1 },
  { name: "AIIMS Blood Bank", vicinity: "Ansari Nagar, New Delhi", rating: 4.3, user_ratings_total: 8600, opening_hours: { open_now: true }, geometry: { location: { lat: 28.5672, lng: 77.2100 } }, place_id: "aiims", types: ["hospital"], distance: 3.5 },
  { name: "Rajiv Gandhi Cancer Institute", vicinity: "Sector 5, Rohini, Delhi", rating: 4.4, user_ratings_total: 6200, opening_hours: { open_now: true }, geometry: { location: { lat: 28.7340, lng: 77.1130 } }, place_id: "rgci", types: ["hospital"], distance: 5.8 },
  { name: "Kidwai Memorial Institute of Oncology", vicinity: "Dr MH Marigowda Road, Bengaluru", rating: 4.1, user_ratings_total: 4300, opening_hours: { open_now: false }, geometry: { location: { lat: 12.9375, lng: 77.5741 } }, place_id: "kidwai", types: ["hospital"], distance: 7.2 },
  { name: "Adyar Cancer Institute", vicinity: "East Canal Bank Road, Chennai", rating: 4.6, user_ratings_total: 5100, opening_hours: { open_now: true }, geometry: { location: { lat: 13.0067, lng: 80.2573 } }, place_id: "adyar", types: ["hospital"], distance: 4.0 },
  { name: "CMC Vellore Blood Bank", vicinity: "Ida Scudder Road, Vellore", rating: 4.7, user_ratings_total: 9800, opening_hours: { open_now: true }, geometry: { location: { lat: 12.9249, lng: 79.1326 } }, place_id: "cmc", types: ["hospital"], distance: 12.5 },
  { name: "MNJ Institute of Oncology", vicinity: "Red Hills, Hyderabad", rating: 4.0, user_ratings_total: 3200, opening_hours: { open_now: true }, geometry: { location: { lat: 17.3920, lng: 78.4870 } }, place_id: "mnj", types: ["hospital"], distance: 6.3 },
  { name: "Gujarat Cancer Research Institute", vicinity: "Civil Hospital Campus, Ahmedabad", rating: 4.2, user_ratings_total: 2800, opening_hours: { open_now: false }, geometry: { location: { lat: 23.0605, lng: 72.5870 } }, place_id: "gcri", types: ["hospital"], distance: 8.1 },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HospitalFinderPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "open">("all");

  useEffect(() => { loadHospitals(); }, []);

  const loadHospitals = (cityLat?: number, cityLng?: number) => {
    setLoading(true);
    const refLat = cityLat || userLocation?.lat || 19.076;
    const refLng = cityLng || userLocation?.lng || 72.8777;
    const results = SAMPLE_HOSPITALS.map(h => ({
      ...h, distance: parseFloat(haversineDistance(refLat, refLng, h.geometry.location.lat, h.geometry.location.lng).toFixed(1)),
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setHospitals(results);
    setLoading(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); loadHospitals(loc.lat, loc.lng); toast.success("Location found!"); },
      () => toast.error("Could not get location")
    );
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const c = INDIAN_CITIES.find(c => c.name === city);
    if (c) loadHospitals(c.lat, c.lng);
  };

  const filtered = hospitals
    .filter(h => filter === "all" || h.opening_hours?.open_now)
    .filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.vicinity.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageTransition className="max-w-3xl mx-auto space-y-6">
      <GradientHeading subtitle="Find cancer hospitals & blood banks near you">Hospital Finder</GradientHeading>

      <GlassCard className="p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border bg-[hsl(var(--glass)_/_0.03)] pl-9 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
              placeholder="Search hospitals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-[180px] glass border-border rounded-xl"><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent className="glass-strong border-border/50">
              {INDIAN_CITIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <GlowButton variant="secondary" onClick={handleLocateMe}>
            <Navigation className="w-4 h-4 mr-2" /> Locate Me
          </GlowButton>
        </div>
        <div className="flex gap-2">
          <GlowButton variant={filter === "all" ? "primary" : "secondary"} size="sm" onClick={() => setFilter("all")}>All</GlowButton>
          <GlowButton variant={filter === "open" ? "primary" : "secondary"} size="sm" onClick={() => setFilter("open")}>Open Now</GlowButton>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Searching...</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Hospital} title="No hospitals found" description="Try a different search or city" />
        ) : (
          filtered.map((h, i) => (
            <motion.div key={h.place_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard glow className="p-5 hover:bg-[hsl(var(--glass)_/_0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-glow-mint/10 flex items-center justify-center shrink-0 border border-glow-mint/20">
                      <Hospital className="w-5 h-5 text-glow-mint" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground">{h.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" /> {h.vicinity}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {h.rating && (
                          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                            <Star className="w-3 h-3 mr-1 text-warning" /> {h.rating} ({h.user_ratings_total?.toLocaleString()})
                          </Badge>
                        )}
                        {h.opening_hours && (
                          <Badge variant="outline" className={`text-xs ${h.opening_hours.open_now ? "border-success/30 text-success" : "border-destructive/30 text-destructive"}`}>
                            <Clock className="w-3 h-3 mr-1" /> {h.opening_hours.open_now ? "Open" : "Closed"}
                          </Badge>
                        )}
                        {h.distance !== undefined && (
                          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                            <Navigation className="w-3 h-3 mr-1" /> {h.distance} km
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <GlowButton variant="secondary" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${h.geometry.location.lat},${h.geometry.location.lng}`, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-1" /> Map
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </PageTransition>
  );
}
