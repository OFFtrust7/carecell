import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowRight, Droplets, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AnimatedBackground from "@/components/premium/AnimatedBackground";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import { motion } from "framer-motion";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"patient" | "donor">("donor");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          role,
          blood_group: bloodGroup || null,
          phone: phone || null,
          city: city || null,
        } as any).eq("user_id", user.id);
      }
      toast.success("Account created! Please check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-8">
      <AnimatedBackground variant="hero" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-[0_0_40px_hsl(var(--glow-red)_/_0.3)]">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display text-foreground">Join CareCell</h1>
          <p className="text-muted-foreground mt-2 text-sm">Help save lives through blood donation</p>
        </div>

        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass rounded-3xl p-8 space-y-6"
          >
            <div>
              <h2 className="font-display text-xl text-foreground">Create Account</h2>
              <p className="text-xs text-muted-foreground mt-1">Step 1 of 2 — Basic info</p>
            </div>

            <button
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                if (error) toast.error("Google sign-in failed");
              }}
              className="w-full glass rounded-xl py-3 text-sm font-medium text-foreground hover:bg-[hsl(var(--glass)_/_0.08)] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <PremiumInput label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <PremiumInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <PremiumInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">I am a</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "donor" as const, icon: Droplets, label: "Blood Donor", desc: "I want to help by donating" },
                    { value: "patient" as const, icon: Users, label: "Patient", desc: "I need healthcare support" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                        role === opt.value
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--glow-red)_/_0.15)]"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <opt.icon className={`w-6 h-6 ${role === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-sm">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <GlowButton type="submit" className="w-full" size="lg">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </GlowButton>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-8 space-y-6"
          >
            <div>
              <h2 className="font-display text-xl text-foreground">Almost done</h2>
              <p className="text-xs text-muted-foreground mt-1">Step 2 of 2 — Medical & location info</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Blood Group</label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger className="glass border-border rounded-xl"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent className="glass-strong border-border/50">
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <PremiumInput label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <PremiumInput label="City" value={city} onChange={(e) => setCity(e.target.value)} />

              <div className="flex gap-3">
                <GlowButton type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </GlowButton>
                <GlowButton type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </GlowButton>
              </div>
            </form>
          </motion.div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
