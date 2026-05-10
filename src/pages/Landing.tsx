import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Heart, Droplets, Users, ArrowRight, Shield, MapPin, Zap, Activity, X, Eye, EyeOff } from "lucide-react";
import Scene3D from "@/components/landing/Scene3D";
import MagneticButton from "@/components/landing/MagneticButton";
import carecellLogo from "@/assets/carecell-logo.png";

/* ─── Animation Variants ─── */
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const navReveal = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const modalSpring = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

/* ─── Page ─── */
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [is3DVisible, setIs3DVisible] = useState(true);

  // Check if mobile — hide 3D on small screens
  useEffect(() => {
    const check = () => setIs3DVisible(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll progress for 3D scene
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();
  const openModal = useCallback(
    (mode: "signin" | "signup") => {
      navigate(mode === "signin" ? "/login" : "/register");
    },
    [navigate]
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      {/* 3D Background — Desktop only */}
      {is3DVisible && <Scene3D scrollProgress={scrollProgress} />}

      {/* Fallback gradient — Mobile */}
      {!is3DVisible && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(230,57,70,0.18)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(6,214,160,0.14)_0%,_transparent_50%)]" />
          {/* Animated SVG particles for mobile */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {[...Array(15)].map((_, i) => (
              <circle
                key={i}
                cx={`${10 + Math.random() * 80}%`}
                cy={`${10 + Math.random() * 80}%`}
                r={1 + Math.random() * 2}
                fill={i % 2 === 0 ? "rgba(230,57,70,0.5)" : "rgba(6,214,160,0.5)"}
              >
                <animate
                  attributeName="cy"
                  values={`${20 + Math.random() * 60}%;${15 + Math.random() * 60}%;${20 + Math.random() * 60}%`}
                  dur={`${4 + Math.random() * 4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.2;0.7;0.2"
                  dur={`${3 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* ─── Glassmorphic Header ─── */}
        <motion.header
          initial="hidden"
          animate="visible"
          className="sticky top-0 z-50 border-b border-white/[0.06]"
        >
          <div className="backdrop-blur-2xl bg-white/[0.02] saturate-150">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <motion.div custom={0} variants={navReveal} className="flex items-center gap-3">
                <img
                  src={carecellLogo}
                  alt="CareCell Network"
                  width={34}
                  height={34}
                  className="drop-shadow-[0_0_12px_rgba(230,57,70,0.5)]"
                />
                <span className="font-display text-xl bg-gradient-to-r from-[#e63946] to-[#06d6a0] bg-clip-text text-transparent">
                  CareCell Network
                </span>
              </motion.div>

              <nav className="hidden md:flex items-center gap-6">
                {["About", "Features", "Dashboard"].map((label, i) => (
                  <motion.a
                    key={label}
                    custom={i + 1}
                    variants={navReveal}
                    href={`#${label.toLowerCase()}`}
                    className="text-sm text-white/50 hover:text-white transition-colors relative group"
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#e63946] to-[#06d6a0] group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <motion.button
                  custom={4}
                  variants={navReveal}
                  onClick={() => openModal("signin")}
                  className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </motion.button>
                <motion.div custom={5} variants={navReveal}>
                  <MagneticButton
                    onClick={() => openModal("signup")}
                    className="bg-gradient-to-r from-[#e63946] to-[#06d6a0] text-white text-sm shadow-[0_0_25px_rgba(230,57,70,0.3)]"
                  >
                    Get Started
                  </MagneticButton>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ─── Hero ─── */}
        <section className="min-h-[90vh] flex items-center justify-center px-4 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="mb-8 md:hidden">
              <img
                src={carecellLogo}
                alt="CareCell Network Logo"
                width={100}
                height={100}
                className="mx-auto drop-shadow-[0_0_40px_rgba(230,57,70,0.5)]"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-sm mb-8"
            >
              <Droplets className="w-4 h-4 text-[#06d6a0]" />
              <span className="bg-gradient-to-r from-[#e63946] to-[#06d6a0] bg-clip-text text-transparent font-medium">
                Saving lives, one donation at a time
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display leading-[1.1] mb-6 tracking-tight"
            >
              Real-time Blood & Platelet
              <br />
              <span className="bg-gradient-to-r from-[#e63946] via-[#7c3aed] to-[#06d6a0] bg-clip-text text-transparent">
                Donor Matching
              </span>
              <br />
              <span className="text-white/90">for Cancer Patients</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base md:text-lg text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
              CareCell Network connects cancer patients needing blood or platelet donations
              with nearby compatible donors in real-time. Fast, reliable, life-saving.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                onClick={() => openModal("signup")}
                className="bg-gradient-to-r from-[#e63946] to-[#06d6a0] text-white shadow-[0_0_35px_rgba(230,57,70,0.35)] hover:shadow-[0_0_50px_rgba(230,57,70,0.5)] text-base"
              >
                Join as Donor <ArrowRight className="w-4 h-4 ml-2 inline-block" />
              </MagneticButton>
              <button
                onClick={() => openModal("signup")}
                className="px-8 py-3 rounded-xl border border-white/15 text-white/80 hover:bg-white/[0.06] hover:border-white/25 transition-all backdrop-blur-sm text-base"
              >
                I Need Blood
              </button>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-16"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-6 h-10 rounded-full border-2 border-white/20 mx-auto flex items-start justify-center pt-2"
              >
                <div className="w-1 h-2 rounded-full bg-white/40" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── About ─── */}
        <section id="about" className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-14"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#06d6a0]/20 border border-white/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#06d6a0]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display">About CareCell</h2>
              </div>
              <p className="text-white/40 leading-relaxed text-base md:text-lg mb-6">
                CareCell Network is a next-generation healthcare platform designed specifically
                for cancer patients and blood donors. We bridge the critical gap between patients
                in urgent need and willing donors nearby — using real-time matching, smart
                notifications, and military-grade encryption.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { v: "8", l: "Blood Groups", ic: Droplets },
                  { v: "3", l: "Urgency Levels", ic: Zap },
                  { v: "25km", l: "Match Radius", ic: MapPin },
                  { v: "24/7", l: "Real-time", ic: Activity },
                ].map(({ v, l, ic: Icon }, i) => (
                  <motion.div
                    key={l}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <Icon className="w-4 h-4 mx-auto text-[#06d6a0]/50 mb-2" />
                    <p className="text-2xl font-display bg-gradient-to-r from-[#e63946] to-[#06d6a0] bg-clip-text text-transparent">
                      {v}
                    </p>
                    <p className="text-xs text-white/35">{l}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-display mb-3">How It Works</h2>
              <p className="text-white/35 max-w-md mx-auto">
                Three simple steps to connect patients with life-saving donors
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Create a Request",
                  desc: "Patients post blood/platelet needs with urgency levels. Critical requests auto-expire in 6 hours.",
                },
                {
                  icon: MapPin,
                  title: "Smart Matching",
                  desc: "Our system matches compatible donors by blood group and proximity within 25 km radius.",
                },
                {
                  icon: Heart,
                  title: "Save a Life",
                  desc: "Donors respond with one tap. Patients confirm and coordinate the donation directly.",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-7 text-center hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e63946]/15 to-[#06d6a0]/15 border border-white/[0.08] flex items-center justify-center mx-auto mb-5 group-hover:shadow-[0_0_30px_rgba(230,57,70,0.15)] transition-shadow duration-500">
                    <card.icon className="w-7 h-7 text-[#06d6a0]" />
                  </div>
                  <h3 className="text-lg font-display mb-2">{card.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Dashboard Preview ─── */}
        <section id="dashboard" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display mb-3">Your Dashboard</h2>
              <p className="text-white/35 max-w-md mx-auto">
                Role-based dashboards with real-time updates and smart alerts
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 5 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
            >
              {/* Mock dashboard chrome */}
              <div className="h-10 bg-white/[0.03] border-b border-white/[0.06] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c940]" />
                <span className="text-xs text-white/20 ml-4 font-mono">carecell.app/dashboard</span>
              </div>
              <div className="p-6 md:p-8 grid md:grid-cols-3 gap-4">
                {[
                  { title: "Active Requests", value: "12", color: "from-[#e63946]" },
                  { title: "Donors Matched", value: "47", color: "from-[#06d6a0]" },
                  { title: "Lives Saved", value: "156", color: "from-[#7c3aed]" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5"
                  >
                    <p className="text-xs text-white/30 mb-1">{stat.title}</p>
                    <p className={`text-3xl font-display bg-gradient-to-r ${stat.color} to-[#06d6a0] bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Trust / Security ─── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-10 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e63946]/15 to-[#06d6a0]/15 border border-white/10 flex items-center justify-center mx-auto mb-5">
                <Shield className="w-7 h-7 text-[#06d6a0]" />
              </div>
              <h2 className="text-2xl font-display mb-3">Secure & Private</h2>
              <p className="text-white/35 leading-relaxed">
                Your medical data is encrypted and only shared with confirmed donors.
                Patient health cards with QR codes provide quick access in emergencies
                without exposing sensitive information.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-white/35 mb-8">Join CareCell Network today and help save lives.</p>
            <MagneticButton
              onClick={() => openModal("signup")}
              className="bg-gradient-to-r from-[#e63946] to-[#06d6a0] text-white text-base shadow-[0_0_35px_rgba(230,57,70,0.3)]"
            >
              Get Started Now <ArrowRight className="w-4 h-4 ml-2 inline-block" />
            </MagneticButton>
          </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="py-8 px-4 text-center text-sm text-white/25 border-t border-white/[0.05]">
          <p>© 2026 CareCell Network. Built with ❤️ to save lives.</p>
        </footer>
      </div>

    </div>
  );
}

/* ─── Auth Modal Component ─── */
function AuthModal({
  mode,
  onClose,
  onSwitch,
}: {
  mode: "signin" | "signup";
  onClose: () => void;
  onSwitch: () => void;
}) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        variants={modalSpring}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0d0d1a]/95 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(230,57,70,0.1)]"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/50" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={carecellLogo}
            alt="CareCell"
            width={48}
            height={48}
            className="mx-auto mb-4 drop-shadow-[0_0_20px_rgba(230,57,70,0.4)]"
          />
          <h2 className="text-2xl font-display">
            {mode === "signin" ? "Welcome Back" : "Join CareCell"}
          </h2>
          <p className="text-sm text-white/35 mt-1">
            {mode === "signin"
              ? "Sign in to your account"
              : "Create your account to get started"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(mode === "signin" ? "/login" : "/register");
          }}
          className="space-y-4"
        >
          {mode === "signup" && (
            <FloatingInput label="Full Name" type="text" />
          )}
          <FloatingInput label="Email" type="email" />
          <div className="relative">
            <FloatingInput
              label="Password"
              type={showPassword ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <MagneticButton
            onClick={() => navigate(mode === "signin" ? "/login" : "/register")}
            className="w-full bg-gradient-to-r from-[#e63946] to-[#06d6a0] text-white shadow-[0_0_25px_rgba(230,57,70,0.25)] py-3"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </MagneticButton>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={onSwitch} className="text-[#06d6a0] hover:underline">
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Floating Label Input ─── */
function FloatingInput({ label, type }: { label: string; type: string }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
        className="w-full px-4 pt-5 pb-2 rounded-xl border border-white/[0.1] bg-white/[0.03] text-white outline-none focus:border-[#e63946]/50 focus:ring-1 focus:ring-[#e63946]/30 transition-all peer"
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          focused || hasValue
            ? "top-1.5 text-[10px] text-[#06d6a0]"
            : "top-3.5 text-sm text-white/30"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
