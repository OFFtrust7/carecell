import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import AnimatedBackground from "@/components/premium/AnimatedBackground";
import GlowButton from "@/components/premium/GlowButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <AnimatedBackground variant="hero" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 space-y-6"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-2 shadow-[0_0_40px_hsl(var(--glow-violet)_/_0.3)]">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-7xl font-display text-gradient">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/">
          <GlowButton size="lg">Return to Home</GlowButton>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
