import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Heart, Phone, Droplets, User, Hospital, AlertTriangle, Download } from "lucide-react";
import { useRef } from "react";

export default function PatientCardPage() {
  const { profile } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  if (!profile) return null;

  const qrData = JSON.stringify({
    name: profile.full_name,
    blood_group: profile.blood_group,
    cancer_type: profile.cancer_type,
    cancer_stage: profile.cancer_stage,
    allergies: profile.allergies,
    emergency_contact: profile.emergency_contact_phone,
    gender: profile.gender,
  });

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-display text-foreground">Patient Health Card</h1>
      <p className="text-muted-foreground">Your digital health card with QR code. Share it with hospitals and emergency contacts.</p>

      <Card ref={cardRef} className="overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary-foreground" />
          <span className="text-primary-foreground font-display text-xl">CareCell Health Card</span>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Patient info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-display text-foreground">{profile.full_name || "Name not set"}</h2>
              {profile.gender && <p className="text-sm text-muted-foreground">{profile.gender} {profile.date_of_birth ? `• DOB: ${profile.date_of_birth}` : ""}</p>}
              {profile.city && <p className="text-sm text-muted-foreground">{profile.city}{profile.state ? `, ${profile.state}` : ""}</p>}
            </div>
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              {profile.blood_group ? (
                <span className="text-2xl font-bold text-primary">{profile.blood_group}</span>
              ) : (
                <Droplets className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>

          {/* Medical info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon={Droplets} label="Blood Group" value={profile.blood_group || "Not set"} />
            <InfoItem icon={Hospital} label="Cancer Type" value={profile.cancer_type || "Not set"} />
            <InfoItem icon={AlertTriangle} label="Stage" value={profile.cancer_stage || "Not set"} />
            <InfoItem icon={User} label="Doctor" value={profile.doctor_name || "Not set"} />
          </div>

          {profile.allergies && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-medium text-destructive mb-1">⚠️ Allergies</p>
              <p className="text-sm">{profile.allergies}</p>
            </div>
          )}

          {/* Emergency contact */}
          {profile.emergency_contact_phone && (
            <div className="p-3 rounded-lg bg-urgent/10 border border-urgent/20">
              <p className="text-xs font-medium text-urgent mb-1">Emergency Contact</p>
              <p className="text-sm font-medium">{profile.emergency_contact_name || "—"}</p>
              <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" />{profile.emergency_contact_phone}</p>
            </div>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 pt-4 border-t">
            <p className="text-xs text-muted-foreground">Scan to view patient info</p>
            <QRCodeSVG value={qrData} size={160} bgColor="transparent" fgColor="hsl(var(--foreground))" />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Update your medical info in <a href="/profile" className="text-primary underline">Profile</a> to keep this card accurate.
      </p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
