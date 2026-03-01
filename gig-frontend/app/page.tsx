"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/LoginCard";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

const features = [
  { num: "01", text: "Collaborative Gig Marketplace" },
  { num: "02", text: "SkillScore Reputation System" },
  { num: "03", text: "Proof of Work Portfolio" },
  { num: "04", text: "Real-time Leaderboards" },
];

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-sky-400 to-sky-600",
  "from-indigo-400 to-indigo-600",
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left Section - Branding */}
      <div className="hidden md:flex w-1/2 bg-[#0F172A] text-white p-14 flex-col justify-between relative overflow-hidden">

        {/* Dot-grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #93c5fd 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow accent */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-2xl font-bold tracking-tight">
            Skill<span className="text-blue-400">Gig</span>
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Developer Collaboration Platform
          </div>

          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight mb-5">
            Build Skills.
            <br />
            <span className="text-blue-400">Ship Together.</span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-xs">
            Find collaborators, earn reputation through real work, and build a portfolio that proves your expertise.
          </p>

          {/* Numbered feature list */}
          <div className="space-y-5">
            {features.map((item) => (
              <div key={item.num} className="flex items-center gap-4">
                <span className="text-xs font-mono text-blue-400/50 w-5 shrink-0">{item.num}</span>
                <div className="w-8 h-px bg-white/10" />
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer avatar row */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {avatarColors.map((c, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${c} border-2 border-[#0F172A] shrink-0`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            Trusted by developers across <span className="text-slate-400 font-medium">50+ institutions</span>
          </span>
        </div>
      </div>

      {/* Right Section - Login */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
        {/* Subtle corner accent */}
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full flex justify-center">
          <LoginCard />
        </div>
      </div>
    </div>
  );
}
