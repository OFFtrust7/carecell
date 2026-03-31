import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Droplets, Users, ArrowRight, Shield, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">CareCell Network</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/register"><Button size="sm">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Droplets className="w-4 h-4" /> Saving lives, one donation at a time
            </div>
            <h1 className="text-4xl md:text-6xl font-display text-foreground leading-tight mb-6">
              Real-time Blood & Platelet<br />
              <span className="text-primary">Donor Matching</span><br />
              for Cancer Patients
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              CareCell Network connects cancer patients needing blood or platelet donations
              with nearby compatible donors in real-time. Fast, reliable, life-saving.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Join as Donor <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="px-8">
                  I Need Blood
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card border-y">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Create a Request"
              description="Patients post blood/platelet needs with urgency levels. Critical requests auto-expire in 6 hours."
            />
            <FeatureCard
              icon={MapPin}
              title="Smart Matching"
              description="Our system matches compatible donors by blood group and proximity within 25 km radius."
            />
            <FeatureCard
              icon={Heart}
              title="Save a Life"
              description="Donors respond with one tap. Patients confirm and coordinate the donation directly."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatBlock value="8" label="Blood Groups Supported" />
          <StatBlock value="3" label="Urgency Levels" />
          <StatBlock value="25km" label="Matching Radius" />
          <StatBlock value="24/7" label="Real-time Alerts" />
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-4 bg-card border-y">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-display mb-3">Secure & Private</h2>
          <p className="text-muted-foreground">
            Your medical data is encrypted and only shared with confirmed donors.
            Patient health cards with QR codes provide quick access in emergencies
            without exposing sensitive information.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground">
        <p>© 2026 CareCell Network. Built with ❤️ to save lives.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center space-y-3"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-display">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-display text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
