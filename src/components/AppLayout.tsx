import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Home, PlusCircle, Droplets, CreditCard, User, LogOut, Menu, X, Calendar, Hospital, Bot, Users, UserPlus, Activity, FileText, Siren, Search, HeartHandshake } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import EmergencyBanner from "@/components/EmergencyBanner";
import ThemeVariantToggle from "@/components/ThemeVariantToggle";
import { useState } from "react";
import { useAppointmentReminders } from "@/hooks/useAppointmentReminders";
import { useThemeVariant } from "@/hooks/useThemeVariant";
import AnimatedBackground from "@/components/premium/AnimatedBackground";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/emergency", label: "Emergency", icon: Siren },
  { path: "/create-request", label: "New Request", icon: PlusCircle, role: "patient" as const },
  { path: "/my-requests", label: "My Requests", icon: Droplets, role: "patient" as const },
  { path: "/donor-matching", label: "Find Donors", icon: Search, role: "patient" as const },
  { path: "/treatment-timeline", label: "Timeline", icon: Activity, role: "patient" as const },
  { path: "/medical-documents", label: "Documents", icon: FileText, role: "patient" as const },
  { path: "/caregivers", label: "Caregivers", icon: Users, role: "patient" as const },
  { path: "/caregiver", label: "Caring For", icon: HeartHandshake },
  { path: "/donor-feed", label: "Donor Feed", icon: Droplets, role: "donor" as const },
  { path: "/donor-details", label: "Donor Details", icon: UserPlus, role: "donor" as const },
  { path: "/appointments", label: "Appointments", icon: Calendar },
  { path: "/hospital-finder", label: "Hospitals", icon: Hospital },
  { path: "/ai-chat", label: "AI Assistant", icon: Bot },
  { path: "/patient-card", label: "Health Card", icon: CreditCard, role: "patient" as const },
  { path: "/patients", label: "Patients", icon: Users },
  { path: "/profile", label: "Profile", icon: User },
];

const BOTTOM_NAV_PATIENT = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/emergency", label: "SOS", icon: Siren },
  { path: "/treatment-timeline", label: "Timeline", icon: Activity },
  { path: "/ai-chat", label: "AI", icon: Bot },
  { path: "/profile", label: "Profile", icon: User },
];

const BOTTOM_NAV_DONOR = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/donor-feed", label: "Feed", icon: Droplets },
  { path: "/donor-details", label: "Details", icon: UserPlus },
  { path: "/ai-chat", label: "AI", icon: Bot },
  { path: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { variant } = useThemeVariant();
  useAppointmentReminders();

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.role || item.role === profile?.role
  );

  const bottomNav = profile?.role === "donor" ? BOTTOM_NAV_DONOR : BOTTOM_NAV_PATIENT;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground variant="subtle" />
      <EmergencyBanner />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50">
        <div className="glass-strong">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_16px_hsl(var(--glow-red)_/_0.3)] group-hover:shadow-[0_0_24px_hsl(var(--glow-red)_/_0.4)] transition-shadow">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg text-foreground">CareCell</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                    <span className="hidden xl:inline">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
              <div className="ml-2 flex items-center gap-1">
                <NotificationBell />
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass)_/_0.05)] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>

            {/* Mobile controls */}
            <div className="flex items-center gap-1 lg:hidden">
              <NotificationBell />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border/50 glass-strong overflow-hidden"
            >
              <div className="px-4 py-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
                {filteredNav.map((item, i) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-primary/10 text-foreground border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass)_/_0.05)]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground w-full mt-2 border-t border-border/50 pt-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-strong border-t border-border/50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 py-1 px-3 group"
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  active ? "bg-primary/15" : "group-hover:bg-[hsl(var(--glass)_/_0.05)]"
                }`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`} />
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-glow"
                      className="absolute inset-0 rounded-xl bg-primary/10 shadow-[0_0_12px_hsl(var(--glow-red)_/_0.2)]"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
