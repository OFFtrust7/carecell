import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, isPast, isToday, isTomorrow, differenceInHours } from "date-fns";
import { Plus, CalendarIcon, Clock, MapPin, User, Pill, TestTube, Stethoscope, Trash2, Edit, Bell, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";

const APPOINTMENT_TYPES = [
  { value: "chemotherapy", label: "Chemotherapy", icon: Pill, color: "bg-glow-violet/10 text-glow-violet" },
  { value: "lab_test", label: "Lab Test", icon: TestTube, color: "bg-glow-mint/10 text-glow-mint" },
  { value: "follow_up", label: "Follow-up Visit", icon: Stethoscope, color: "bg-success/10 text-success" },
  { value: "radiation", label: "Radiation Therapy", icon: Pill, color: "bg-warning/10 text-warning" },
  { value: "other", label: "Other", icon: CalendarIcon, color: "bg-muted text-muted-foreground" },
];

interface Appointment {
  id: string; user_id: string; title: string; appointment_type: string;
  description: string | null; appointment_date: string; reminder_date: string | null;
  location: string | null; doctor_name: string | null; status: string;
  notes: string | null; created_at: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", appointment_type: "follow_up", description: "",
    appointment_date: new Date(), appointment_time: "09:00",
    reminder_hours: "24", location: "", doctor_name: "", notes: "",
  });

  useEffect(() => { if (user) fetchAppointments(); }, [user]);

  const fetchAppointments = async () => {
    const { data, error } = await supabase.from("appointments").select("*").eq("user_id", user!.id).order("appointment_date", { ascending: true });
    if (!error) setAppointments((data as unknown as Appointment[]) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: "", appointment_type: "follow_up", description: "", appointment_date: new Date(), appointment_time: "09:00", reminder_hours: "24", location: "", doctor_name: "", notes: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !user) return;
    const [hours, minutes] = form.appointment_time.split(":").map(Number);
    const appointmentDate = new Date(form.appointment_date);
    appointmentDate.setHours(hours, minutes, 0, 0);
    const reminderDate = form.reminder_hours ? new Date(appointmentDate.getTime() - parseInt(form.reminder_hours) * 60 * 60 * 1000) : null;

    const payload = {
      user_id: user.id, title: form.title, appointment_type: form.appointment_type,
      description: form.description || null, appointment_date: appointmentDate.toISOString(),
      reminder_date: reminderDate?.toISOString() || null, location: form.location || null,
      doctor_name: form.doctor_name || null, notes: form.notes || null, status: "upcoming",
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("appointments").update(payload as any).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("appointments").insert(payload as any));
    }
    if (error) toast.error(error.message);
    else { toast.success(editingId ? "Appointment updated!" : "Appointment created!"); resetForm(); setDialogOpen(false); fetchAppointments(); }
  };

  const handleEdit = (apt: Appointment) => {
    const date = new Date(apt.appointment_date);
    setForm({
      title: apt.title, appointment_type: apt.appointment_type,
      description: apt.description || "", appointment_date: date,
      appointment_time: format(date, "HH:mm"),
      reminder_hours: apt.reminder_date ? String(Math.round(differenceInHours(date, new Date(apt.reminder_date)))) : "24",
      location: apt.location || "", doctor_name: apt.doctor_name || "", notes: apt.notes || "",
    });
    setEditingId(apt.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchAppointments(); }
  };

  const markComplete = async (id: string) => {
    const { error } = await supabase.from("appointments").update({ status: "completed" } as any).eq("id", id);
    if (!error) { toast.success("Marked as completed"); fetchAppointments(); }
  };

  const upcoming = appointments.filter(a => a.status === "upcoming" && !isPast(new Date(a.appointment_date)));
  const today = appointments.filter(a => isToday(new Date(a.appointment_date)));
  const past = appointments.filter(a => a.status === "completed" || (a.status === "upcoming" && isPast(new Date(a.appointment_date))));
  const getTypeInfo = (type: string) => APPOINTMENT_TYPES.find(t => t.value === type) || APPOINTMENT_TYPES[4];

  const AppointmentCard = ({ apt }: { apt: Appointment }) => {
    const typeInfo = getTypeInfo(apt.appointment_type);
    const Icon = typeInfo.icon;
    const date = new Date(apt.appointment_date);
    const isUpcoming = !isPast(date) && apt.status === "upcoming";
    const hoursUntil = differenceInHours(date, new Date());
    const isSoon = hoursUntil > 0 && hoursUntil <= 24;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <GlassCard className={cn("p-4 hover:bg-[hsl(var(--glass)_/_0.06)]", isSoon && isUpcoming && "border-primary/30 shadow-[0_0_15px_hsl(var(--glow-violet)_/_0.1)]")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeInfo.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate text-foreground">{apt.title}</h3>
                  {isSoon && isUpcoming && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary shrink-0">
                      <Bell className="w-3 h-3 mr-1" />{hoursUntil}h
                    </Badge>
                  )}
                  {apt.status === "completed" && (
                    <Badge className="bg-success/10 text-success text-xs shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" /> Done
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(date, "h:mm a")}</span>
                  {apt.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.location}</span>}
                  {apt.doctor_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />Dr. {apt.doctor_name}</span>}
                </div>
                {apt.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{apt.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isUpcoming && (
                <button onClick={() => markComplete(apt.id)} className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => handleEdit(apt)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass)_/_0.05)] transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(apt.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  return (
    <PageTransition className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <GradientHeading subtitle="Manage appointments, chemo sessions & lab tests">
          Treatment Tracker
        </GradientHeading>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <GlowButton><Plus className="w-4 h-4 mr-2" /> Add Appointment</GlowButton>
          </DialogTrigger>
          <DialogContent className="max-w-md glass-strong border-border/50 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">{editingId ? "Edit" : "New"} Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <PremiumInput label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <Select value={form.appointment_type} onValueChange={v => setForm(f => ({ ...f, appointment_type: v }))}>
                  <SelectTrigger className="glass border-border rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-strong border-border/50">
                    {APPOINTMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full glass border-border rounded-xl px-4 py-2.5 text-sm text-left flex items-center gap-2 text-foreground">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        {format(form.appointment_date, "MMM d, yyyy")}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-strong border-border/50" align="start">
                      <Calendar mode="single" selected={form.appointment_date} onSelect={d => d && setForm(f => ({ ...f, appointment_date: d }))} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <PremiumInput label="Time" type="time" value={form.appointment_time} onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Remind me before</label>
                <Select value={form.reminder_hours} onValueChange={v => setForm(f => ({ ...f, reminder_hours: v }))}>
                  <SelectTrigger className="glass border-border rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-strong border-border/50">
                    <SelectItem value="1">1 hour before</SelectItem>
                    <SelectItem value="2">2 hours before</SelectItem>
                    <SelectItem value="6">6 hours before</SelectItem>
                    <SelectItem value="24">1 day before</SelectItem>
                    <SelectItem value="48">2 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PremiumInput label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                <PremiumInput label="Doctor" value={form.doctor_name} onChange={e => setForm(f => ({ ...f, doctor_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Additional details..." rows={2} className="glass border-border rounded-xl text-foreground placeholder:text-muted-foreground/50" />
              </div>
              <GlowButton onClick={handleSubmit} className="w-full">{editingId ? "Update" : "Create"} Appointment</GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {today.length > 0 && (
        <GlassCard holo className="p-6 space-y-3">
          <h3 className="text-base font-display flex items-center gap-2 text-foreground">
            <Bell className="w-4 h-4 text-glow-mint" /> Today's Appointments
          </h3>
          {today.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
        </GlassCard>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="glass border-border/50">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-3">
          <AnimatePresence>
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="No upcoming appointments" description="Add one above to get started!" />
            ) : upcoming.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="past" className="space-y-3">
          <AnimatePresence>
            {past.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="No past appointments" />
            ) : past.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
