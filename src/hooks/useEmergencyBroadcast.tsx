import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface EmergencyBroadcast {
  id: string;
  patient_id: string;
  patient_name: string;
  blood_group: string;
  reason: string;
  city: string | null;
  hospital_name: string | null;
  contact_phone: string;
  status: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Subscribes donors to live emergency broadcasts matching their blood group.
 * Returns the most recent live SOS (within last 30 min) for the floating banner.
 */
export function useEmergencyBroadcast() {
  const { profile } = useAuth();
  const [active, setActive] = useState<EmergencyBroadcast[]>([]);
  const [latest, setLatest] = useState<EmergencyBroadcast | null>(null);

  useEffect(() => {
    if (!profile || profile.role !== "donor" || !profile.blood_group) return;

    const load = async () => {
      const { data } = await supabase
        .from("emergency_requests")
        .select("*")
        .eq("status", "active")
        .eq("blood_group", profile.blood_group as any)
        .order("created_at", { ascending: false })
        .limit(10);
      const items = (data as any[]) || [];
      setActive(items);
      // surface only very recent ones (<30min) as banner
      const cutoff = Date.now() - 30 * 60 * 1000;
      const recent = items.find((r: any) => new Date(r.created_at).getTime() > cutoff);
      setLatest(recent || null);
    };
    load();

    const channel = supabase
      .channel(`sos:${profile.blood_group}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_requests", filter: `blood_group=eq.${profile.blood_group}` },
        (payload) => {
          const sos = payload.new as EmergencyBroadcast;
          setActive((prev) => [sos, ...prev]);
          setLatest(sos);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "emergency_requests" },
        (payload) => {
          const sos = payload.new as EmergencyBroadcast;
          if (sos.status !== "active") {
            setActive((prev) => prev.filter((s) => s.id !== sos.id));
            setLatest((cur) => (cur?.id === sos.id ? null : cur));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const dismiss = () => setLatest(null);

  return { active, latest, dismiss };
}
