"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginCard() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (mode === "signup") {
      if (!form.fullName.trim()) { toast.error("Please enter your full name."); return; }
      if (form.password !== form.confirmPassword) { toast.error("Passwords do not match."); return; }
      if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(form.email, form.password);
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        const result = await signUpWithEmail(form.email, form.password, form.fullName);
        if (result?.needsConfirmation) {
          // Email confirmation required — show message instead of redirecting
          setEmailSent(true);
          toast.success("Account created! Check your email to confirm your account.");
        } else {
          // Auto-confirmed — send to register to fill department/year
          toast.success("Account created! Complete your profile.");
          router.push("/register");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const lower = msg.toLowerCase();
      // Give a friendlier message for common errors
      if (lower.includes("rate limit") || lower.includes("email rate")) {
        toast.error("Too many signup attempts. Go to Supabase → Auth → Email → turn OFF 'Confirm email', then try again.");
      } else if (lower.includes("invalid login credentials")) {
        toast.error("Incorrect email or password. Did you sign up first?");
      } else if (lower.includes("email not confirmed")) {
        toast.error("Please confirm your email first. Check your inbox.");
      } else if (lower.includes("user already registered")) {
        toast.error("An account with this email already exists. Try signing in.");
        setMode("signin");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Mobile Logo */}
      <div className="md:hidden text-center mb-8">
        <span className="text-3xl font-bold text-[#0F172A]">
          Skill<span className="text-blue-600">Gig</span>
        </span>
      </div>

      {/* Email confirmation sent screen */}
      {emailSent ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 mb-2">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-semibold text-slate-800 mb-4">{form.email}</p>
            <p className="text-xs text-slate-400 mb-6">
              Click the link in the email to activate your account, then come back here to sign in.
            </p>
            <button
              onClick={() => { setEmailSent(false); setMode("signin"); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Blue top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500" />

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">
              {mode === "signin" ? "Sign in to SkillGig" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === "signin"
                ? "Connect with developers. Build your reputation."
                : "Join the developer collaboration platform."}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-lg border border-slate-200 mb-6 overflow-hidden">
            <button type="button" onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "signin" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              Sign In
            </button>
            <button type="button" onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="Your name" required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required minLength={6}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" required minLength={6}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              {submitting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {submitting
                ? (mode === "signin" ? "Signing in…" : "Creating account…")
                : (mode === "signin" ? "Sign In" : "Create Account")}
            </button>
          </form>

          {/* Stats */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Platform</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ label: "Gigs", value: "1.2k+" }, { label: "Devs", value: "850+" }, { label: "Collabs", value: "3.4k+" }].map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-lg py-3 text-center border border-slate-100">
                <div className="text-sm font-bold text-[#0F172A]">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )} {/* end emailSent ternary */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}
