import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CHECK_INTERVAL_MS = 60_000; // check every minute
const NOTIFIED_KEY = "carecell_notified_appointments";

function getNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markNotified(id: string) {
  const set = getNotified();
  set.add(id);
  // keep only last 200 entries
  const arr = [...set].slice(-200);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
}

export function useAppointmentReminders() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/placeholder.svg",
        badge: "/placeholder.svg",
      });
    }
    // Also show in-app toast as fallback
    toast.info(title, { description: body, duration: 10000 });
  }, []);

  const checkReminders = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const notified = getNotified();

    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "upcoming")
      .gte("appointment_date", now.toISOString())
      .order("appointment_date", { ascending: true })
      .limit(50);

    if (!data) return;

    for (const apt of data) {
      if (notified.has(apt.id)) continue;

      const appointmentDate = new Date(apt.appointment_date);
      const reminderDate = apt.reminder_date ? new Date(apt.reminder_date) : null;

      // Fire if reminder_date has passed (and appointment hasn't)
      const shouldFire = reminderDate
        ? now >= reminderDate && now < appointmentDate
        : false;

      // Also fire if appointment is within 1 hour regardless
      const msUntil = appointmentDate.getTime() - now.getTime();
      const withinOneHour = msUntil > 0 && msUntil <= 60 * 60 * 1000;

      if (shouldFire || withinOneHour) {
        const hoursLeft = Math.round(msUntil / (60 * 60 * 1000));
        const minsLeft = Math.round(msUntil / (60 * 1000));
        const timeStr = hoursLeft >= 1 ? `${hoursLeft}h` : `${minsLeft}min`;

        sendNotification(
          `⏰ ${apt.title}`,
          `Coming up in ${timeStr}${apt.location ? ` at ${apt.location}` : ""}${apt.doctor_name ? ` with Dr. ${apt.doctor_name}` : ""}`
        );
        markNotified(apt.id);
      }
    }
  }, [user, sendNotification]);

  useEffect(() => {
    if (!user) return;

    requestPermission().then((granted) => {
      if (!granted && "Notification" in window && Notification.permission !== "denied") {
        toast.info("Enable notifications to get appointment reminders", {
          action: {
            label: "Enable",
            onClick: () => requestPermission(),
          },
        });
      }
    });

    // Initial check
    checkReminders();

    // Periodic check
    intervalRef.current = setInterval(checkReminders, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, requestPermission, checkReminders]);
}
