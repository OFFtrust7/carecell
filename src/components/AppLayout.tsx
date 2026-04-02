import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Home, PlusCircle, Droplets, CreditCard, User, LogOut, Menu, X, Calendar, Hospital, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAppointmentReminders } from "@/hooks/useAppointmentReminders";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/create-request", label: "New Request", icon: PlusCircle, role: "patient" as const },
  { path: "/donor-feed", label: "Donor Feed", icon: Droplets, role: "donor" as const },
  { path: "/my-requests", label: "My Requests", icon: Droplets, role: "patient" as const },
  { path: "/patients", label: "Patients", icon: Users },
  { path: "/appointments", label: "Appointments", icon: Calendar },
  { path: "/hospital-finder", label: "Hospitals", icon: Hospital },
  { path: "/ai-chat", label: "AI Assistant", icon: Bot },
  { path: "/patient-card", label: "Health Card", icon: CreditCard },
  { path: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  useAppointmentReminders();

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.role || item.role === profile?.role
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">CareCell</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground ml-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t bg-card px-4 py-2 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
