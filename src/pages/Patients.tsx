import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Hospital, Heart, Activity, Stethoscope, Pill, ShieldCheck } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";

const PATIENT_TYPES = [
  { type: "Cancer Patient", icon: Activity, description: "Patients undergoing cancer treatment requiring regular blood transfusions and platelet support.", needs: ["Regular transfusions", "Platelet support", "Chemotherapy follow-ups"] },
  { type: "Surgical Patient", icon: Stethoscope, description: "Pre/post-surgical patients who may need blood during or after procedures.", needs: ["Pre-surgery blood banking", "Post-op monitoring", "Recovery support"] },
  { type: "Thalassemia Patient", icon: Heart, description: "Patients with thalassemia needing regular blood transfusions to manage their condition.", needs: ["Monthly transfusions", "Iron chelation therapy", "Regular check-ups"] },
  { type: "Accident/Trauma", icon: ShieldCheck, description: "Emergency patients from accidents or trauma requiring immediate blood supply.", needs: ["Emergency blood supply", "Intensive care", "Surgical intervention"] },
  { type: "Chronic Disease", icon: Pill, description: "Patients with chronic conditions like kidney disease or sickle cell requiring ongoing care.", needs: ["Dialysis support", "Regular monitoring", "Medication management"] },
];

export default function PatientsPage() {
  const { profile } = useAuth();

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Overview of patient types and quick access to appointments & hospitals">
        Patients
      </GradientHeading>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/appointments">
          <GlassCard
            holo
            whileHover={{ scale: 1.01, y: -2 }}
            className="cursor-pointer p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-glow-violet/10 flex items-center justify-center border border-glow-violet/20">
                <Calendar className="w-7 h-7 text-glow-violet" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-foreground">Appointments</h3>
                <p className="text-sm text-muted-foreground">Schedule & manage your medical appointments</p>
              </div>
              <GlowButton variant="secondary" size="sm">View</GlowButton>
            </div>
          </GlassCard>
        </Link>

        <Link to="/hospital-finder">
          <GlassCard
            holo
            whileHover={{ scale: 1.01, y: -2 }}
            className="cursor-pointer p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-glow-cyan/10 flex items-center justify-center border border-glow-cyan/20">
                <Hospital className="w-7 h-7 text-glow-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-foreground">Find Hospitals</h3>
                <p className="text-sm text-muted-foreground">Search nearby hospitals & blood banks</p>
              </div>
              <GlowButton variant="secondary" size="sm">View</GlowButton>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* Patient types */}
      <div>
        <h2 className="text-xl font-display text-foreground mb-4">Types of Patients We Support</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PATIENT_TYPES.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <motion.div
                key={pt.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard glow className="h-full p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-display text-foreground">{pt.type}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pt.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pt.needs.map((need) => (
                      <Badge key={need} variant="outline" className="text-xs border-border/50 text-muted-foreground">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA for patients */}
      {profile?.role === "patient" && (
        <GlassCard holo className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-foreground">Need blood?</h3>
              <p className="text-sm text-muted-foreground">Create a request and connect with nearby donors instantly.</p>
            </div>
            <Link to="/create-request">
              <GlowButton>Create Blood Request</GlowButton>
            </Link>
          </div>
        </GlassCard>
      )}
    </PageTransition>
  );
}
