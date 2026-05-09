import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, Phone, X, Clock } from "lucide-react";
import { useEmergencyBroadcast } from "@/hooks/useEmergencyBroadcast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EmergencyBanner() {
  const { latest, dismiss } = useEmergencyBroadcast();
  const [secondsLeft, setSecondsLeft] = useState(60);

  const callPatient = async () => {
    if (!latest) return;
    const { data, error } = await supabase.rpc("get_emergency_contact" as any, { p_id: latest.id });
    const row = (data as any[])?.[0];
    if (error || !row?.contact_phone) {
      toast.error("Contact not available");
      return;
    }
    window.location.href = `tel:${row.contact_phone}`;
  };


  useEffect(() => {
    if (!latest) return;
    setSecondsLeft(60);
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          dismiss();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [latest, dismiss]);

  return (
    <AnimatePresence>
      {latest && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[min(640px,calc(100%-2rem))]"
          role="alert"
        >
          <div className="glass-strong border border-critical/40 rounded-2xl shadow-[0_0_40px_hsl(var(--critical)_/_0.3)] overflow-hidden">
            <div className="flex items-stretch">
              <div className="bg-critical/15 px-3 flex items-center">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <Siren className="w-5 h-5 text-critical" />
                </motion.div>
              </div>
              <div className="flex-1 px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {latest.blood_group} needed — {latest.patient_name}
                  </p>
                  <span className="text-[10px] inline-flex items-center gap-1 text-critical font-mono">
                    <Clock className="w-3 h-3" /> {secondsLeft}s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {latest.reason}
                  {latest.city && ` • ${latest.city}`}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2">
                <p className="font-semibold text-sm text-foreground truncate">
                    {latest.blood_group} needed urgently
                  </p>
                  <span className="text-[10px] inline-flex items-center gap-1 text-critical font-mono">
                    <Clock className="w-3 h-3" /> {secondsLeft}s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {latest.reason}
                  {latest.city && ` • ${latest.city}`}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2">
                <button
                  onClick={callPatient}
                  className="p-2 rounded-lg bg-critical text-critical-foreground hover:opacity-90"
                  aria-label="Call patient"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <Link
                  to="/emergency"
                  className="text-xs px-2 py-2 text-foreground hover:text-primary"
                  onClick={dismiss}
                >
                  Open
                </Link>
                <button
                  onClick={dismiss}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
