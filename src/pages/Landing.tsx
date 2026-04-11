import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Droplets, Users, ArrowRight, Shield, MapPin, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import carecellLogo from "@/assets/carecell-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(138,43,226,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(0,206,209,0.12)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(138,43,226,0.05)_0%,_transparent_70%)]" />
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? "rgba(138,43,226,0.6)" : "rgba(0,206,209,0.6)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/5">
          <div className="backdrop-blur-xl bg-white/[0.03]">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={carecellLogo} alt="CareCell Network" width={36} height={36} className="drop-shadow-[0_0_8px_rgba(138,43,226,0.4)]" />
                <span className="font-display text-xl bg-gradient-to-r from-[#8A2BE2] to-[#00CED1] bg-clip-text text-transparent">
                  CareCell Network
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-gradient-to-r from-[#8A2BE2] to-[#00CED1] hover:opacity-90 text-white border-0 shadow-[0_0_20px_rgba(138,43,226,0.3)]">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              className="mb-8"
            >
              <img
                src={carecellLogo}
                alt="CareCell Network Logo"
                width={120}
                height={120}
                className="mx-auto drop-shadow-[0_0_40px_rgba(138,43,226,0.4)]"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-sm text-sm font-medium mb-6"
            >
              <Droplets className="w-4 h-4 text-[#00CED1]" />
              <span className="bg-gradient-to-r from-[#8A2BE2] to-[#00CED1] bg-clip-text text-transparent">
                Saving lives, one donation at a time
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-display leading-tight mb-6"
            >
              Real-time Blood & Platelet
              <br />
              <span className="bg-gradient-to-r from-[#8A2BE2] via-[#6B5CE7] to-[#00CED1] bg-clip-text text-transparent">
                Donor Matching
              </span>
              <br />
              for Cancer Patients
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="text-lg text-white/50 max-w-2xl mx-auto mb-10"
            >
              CareCell Network connects cancer patients needing blood or platelet donations
              with nearby compatible donors in real-time. Fast, reliable, life-saving.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register">
                <Button size="lg" className="px-8 bg-gradient-to-r from-[#8A2BE2] to-[#00CED1] hover:opacity-90 text-white border-0 shadow-[0_0_30px_rgba(138,43,226,0.3)] transition-all hover:shadow-[0_0_40px_rgba(138,43,226,0.5)]">
                  Join as Donor <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="px-8 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  I Need Blood
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display text-center mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/40 text-center mb-14 max-w-lg mx-auto"
            >
              Three simple steps to connect patients with life-saving donors
            </motion.p>
            <div className="grid md:grid-cols-3 gap-6">
              <GlassCard
                icon={Users}
                title="Create a Request"
                description="Patients post blood/platelet needs with urgency levels. Critical requests auto-expire in 6 hours."
                index={0}
              />
              <GlassCard
                icon={MapPin}
                title="Smart Matching"
                description="Our system matches compatible donors by blood group and proximity within 25 km radius."
                index={1}
              />
              <GlassCard
                icon={Heart}
                title="Save a Life"
                description="Donors respond with one tap. Patients confirm and coordinate the donation directly."
                index={2}
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <StatBlock value="8" label="Blood Groups" icon={Droplets} />
                <StatBlock value="3" label="Urgency Levels" icon={Zap} />
                <StatBlock value="25km" label="Match Radius" icon={MapPin} />
                <StatBlock value="24/7" label="Real-time Alerts" icon={Activity} />
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8A2BE2]/20 to-[#00CED1]/20 flex items-center justify-center mx-auto mb-5 border border-white/10">
                <Shield className="w-7 h-7 text-[#00CED1]" />
              </div>
              <h2 className="text-2xl font-display mb-3">Secure & Private</h2>
              <p className="text-white/40 leading-relaxed">
                Your medical data is encrypted and only shared with confirmed donors.
                Patient health cards with QR codes provide quick access in emergencies
                without exposing sensitive information.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display mb-4">Ready to Make a Difference?</h2>
              <p className="text-white/40 mb-8">Join CareCell Network today and help save lives.</p>
              <Link to="/register">
                <Button size="lg" className="px-10 bg-gradient-to-r from-[#8A2BE2] to-[#00CED1] hover:opacity-90 text-white border-0 shadow-[0_0_30px_rgba(138,43,226,0.3)]">
                  Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 text-center text-sm text-white/30 border-t border-white/5">
          <p>© 2026 CareCell Network. Built with ❤️ to save lives.</p>
        </footer>
      </div>
    </div>
  );
}

function GlassCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center space-y-4 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8A2BE2]/20 to-[#00CED1]/20 flex items-center justify-center mx-auto border border-white/10 group-hover:shadow-[0_0_20px_rgba(138,43,226,0.2)] transition-shadow">
        <Icon className="w-7 h-7 text-[#00CED1]" />
      </div>
      <h3 className="text-lg font-display">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatBlock({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-2"
    >
      <Icon className="w-5 h-5 mx-auto text-[#00CED1]/60 mb-1" />
      <p className="text-3xl font-display bg-gradient-to-r from-[#8A2BE2] to-[#00CED1] bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-sm text-white/40">{label}</p>
    </motion.div>
  );
}
