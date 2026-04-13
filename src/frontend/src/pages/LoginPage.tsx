import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  GraduationCap,
  Shield,
} from "lucide-react";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: <Brain size={16} />,
    label: "AI Mentor",
    desc: "Personalized LLM-powered study advice",
  },
  {
    icon: <Calendar size={16} />,
    label: "Smart Timetable",
    desc: "Auto-generated per-student schedule",
  },
  {
    icon: <BookOpen size={16} />,
    label: "PYQ Practice",
    desc: "50+ previous year questions with analytics",
  },
  {
    icon: <BarChart3 size={16} />,
    label: "Performance Tracking",
    desc: "Subject-wise accuracy and weak area alerts",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing, identity } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-sidebar p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-sidebar-primary/15 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <GraduationCap size={22} className="text-accent-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-lg leading-tight">
              AI Prep Mentor
            </p>
            <p className="text-xs text-sidebar-foreground/50">
              NEET / JEE 2025
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-6 relative z-10">
          <div className="space-y-3">
            <h1 className="font-display font-black text-4xl text-sidebar-foreground leading-tight">
              Your AI-powered
              <br />
              <span className="text-accent">study companion</span>
            </h1>
            <p className="text-sidebar-foreground/60 text-base leading-relaxed max-w-sm">
              Adaptive scheduling, real-time mentorship, and data-driven
              insights — all personalised to your learning pace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-border/20 border border-sidebar-border/40"
              >
                <span className="flex-shrink-0 text-accent">{f.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {f.label}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 truncate">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-sidebar-foreground/30 relative z-10">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-sidebar-foreground/60 transition-fast"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap size={22} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-foreground text-lg leading-tight">
              AI Prep Mentor
            </p>
            <p className="text-xs text-muted-foreground">NEET / JEE 2025</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="font-display font-bold text-3xl text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in with Internet Identity to access your personalised study
              dashboard, timetable, and AI mentor.
            </p>
          </div>

          {/* Internet Identity CTA */}
          <div className="space-y-4">
            <Button
              className="w-full h-12 font-semibold text-base gap-3"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              data-ocid="login-btn"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Connecting…
                </>
              ) : isInitializing ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <GraduationCap size={18} />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Shield
                size={14}
                className="mt-0.5 flex-shrink-0 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Internet Identity provides secure, private authentication — your
                identity is cryptographically protected and no passwords are
                stored.
              </p>
            </div>
          </div>

          {/* Feature bullets for mobile */}
          <div className="lg:hidden space-y-2">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2">
                <span className="text-primary flex-shrink-0">{f.icon}</span>
                <span className="text-sm text-muted-foreground">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
