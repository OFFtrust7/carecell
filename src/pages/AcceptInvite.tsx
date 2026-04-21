import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCheck, Heart } from "lucide-react";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";

export default function AcceptInvitePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Stash code and redirect to login
      const target = `/accept-invite${code ? `?code=${code}` : ""}`;
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [user, loading, navigate, code]);

  const accept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Enter an invite code");
    setSubmitting(true);
    const { data, error } = await supabase.rpc("accept_caregiver_invite" as any, {
      p_invite_code: code.trim(),
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    const result = data as any;
    if (!result?.ok) {
      const map: Record<string, string> = {
        not_authenticated: "Please sign in first",
        invalid_code: "Invalid or already-used code",
        cannot_accept_own_invite: "You can't accept your own invite",
      };
      return toast.error(map[result?.error] || "Could not accept invite");
    }
    toast.success("Caregiver access granted 💚");
    navigate("/dashboard");
  };

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="p-8 w-full max-w-md space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <GradientHeading subtitle="Enter the code your loved one shared with you.">
            Accept Caregiver Invite
          </GradientHeading>
        </div>
        <form onSubmit={accept} className="space-y-4">
          <PremiumInput
            label="Invite Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 9f3a8b2c1d"
            required
          />
          <GlowButton type="submit" className="w-full" disabled={submitting}>
            <Heart className="w-4 h-4 mr-2" />
            {submitting ? "Linking..." : "Accept & Link"}
          </GlowButton>
        </form>
      </GlassCard>
    </PageTransition>
  );
}
