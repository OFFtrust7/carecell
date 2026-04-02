import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Hospital, Heart, Activity, Stethoscope, Pill, ShieldCheck } from "lucide-react";

const PATIENT_TYPES = [
  {
    type: "Cancer Patient",
    icon: Activity,
    description: "Patients undergoing cancer treatment requiring regular blood transfusions and platelet support.",
    needs: ["Regular transfusions", "Platelet support", "Chemotherapy follow-ups"],
  },
  {
    type: "Surgical Patient",
    icon: Stethoscope,
    description: "Pre/post-surgical patients who may need blood during or after procedures.",
    needs: ["Pre-surgery blood banking", "Post-op monitoring", "Recovery support"],
  },
  {
    type: "Thalassemia Patient",
    icon: Heart,
    description: "Patients with thalassemia needing regular blood transfusions to manage their condition.",
    needs: ["Monthly transfusions", "Iron chelation therapy", "Regular check-ups"],
  },
  {
    type: "Accident/Trauma",
    icon: ShieldCheck,
    description: "Emergency patients from accidents or trauma requiring immediate blood supply.",
    needs: ["Emergency blood supply", "Intensive care", "Surgical intervention"],
  },
  {
    type: "Chronic Disease",
    icon: Pill,
    description: "Patients with chronic conditions like kidney disease or sickle cell requiring ongoing care.",
    needs: ["Dialysis support", "Regular monitoring", "Medication management"],
  },
];

export default function PatientsPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-display text-foreground">Patients</h1>
        <p className="text-muted-foreground">
          Overview of patient types and quick access to appointments & hospitals
        </p>
      </motion.div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/appointments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary/20 hover:border-primary/40">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">Appointments</h3>
                <p className="text-sm text-muted-foreground">Schedule & manage your medical appointments</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/hospital-finder">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary/20 hover:border-primary/40">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Hospital className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">Find Hospitals</h3>
                <p className="text-sm text-muted-foreground">Search nearby hospitals & blood banks</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </CardContent>
          </Card>
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
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-display">{pt.type}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-sm">{pt.description}</CardDescription>
                    <div className="flex flex-wrap gap-1.5">
                      {pt.needs.map((need) => (
                        <Badge key={need} variant="outline" className="text-xs">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA for patients */}
      {profile?.role === "patient" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Need blood?</h3>
              <p className="text-sm text-muted-foreground">Create a request and connect with nearby donors instantly.</p>
            </div>
            <Link to="/create-request">
              <Button>Create Blood Request</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
