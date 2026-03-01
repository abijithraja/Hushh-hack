"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function Register() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { user, profile, loading: authLoading, isAuthenticated, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    mobile: "",
    dob: "",
    address: "",
    institution: "",
    degree: "",
  });

  // Step 2 fields
  const [year, setYear] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Working Professional"];

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }
      if (profile?.department && profile?.year) {
        router.push("/dashboard");
        return;
      }
      if (user?.user_metadata?.full_name) {
        setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
      }
    }
  }, [authLoading, isAuthenticated, profile, router, user]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Interest tag helpers
  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (!trimmed || interests.includes(trimmed)) { setInterestInput(""); return; }
    setInterests(prev => [...prev, trimmed]);
    setInterestInput("");
  };
  const removeInterest = (item: string) => setInterests(prev => prev.filter(x => x !== item));
  const handleInterestKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addInterest(); }
  };

  const finish = async () => {
    if (!formData.fullName || !formData.department || !year) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setSubmitting(true);

      // Step 1: register via backend (or fallback to Supabase direct)
      const result = await userApi.register({
        full_name: formData.fullName,
        department: formData.department,
        year,
      });

      if (!result && user) {
        const { error } = await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email ?? "",
            full_name: formData.fullName || null,
            department: formData.department || null,
            year: year || null,
          },
          { onConflict: "id" }
        );
        if (error) throw new Error(error.message);
      }

      // Step 2: save extra profile fields directly via Supabase
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            mobile: formData.mobile || null,
            dob: formData.dob || null,
            address: formData.address || null,
            institution: formData.institution || null,
            degree: formData.degree || null,
            year,
          })
          .eq("id", user.id);

        if (profileError) {
          console.warn("Profile extra fields error:", profileError.message);
        }

        // Step 3: save interests
        if (interests.length > 0) {
          // Delete old interests first so re-registration is idempotent
          await supabase.from("interests").delete().eq("user_id", user.id);
          const interestRows = interests.map(item => ({
            user_id: user.id,
            interest_name: item,
          }));
          const { error: interestError } = await supabase.from("interests").insert(interestRows);
          if (interestError) {
            console.warn("Interests insert error:", interestError.message);
          }
        }
      }

      await refreshProfile();
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to save profile. Please try again.");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="mb-6">
          <span className="text-lg font-bold text-[#0F172A]">
            Skill<span className="text-blue-600">Gig</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1 rounded-full mb-2">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Step Indicator */}
        <p className="text-xs text-slate-400 mb-6">Step {step} of 2</p>

        {/* ── Step 1: Personal Info ── */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">Tell us about you</h2>
            <p className="text-sm text-slate-500 mb-5">Fill in your personal &amp; academic details</p>

            <div className="space-y-3 mb-6">
              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              {/* Mobile */}
              <input
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              {/* DOB */}
              <div>
                <label className="block text-xs text-slate-500 mb-1 ml-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Address */}
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              {/* Institution */}
              <input
                type="text"
                placeholder="Institution / College Name"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              {/* Degree */}
              <input
                type="text"
                placeholder="Degree (e.g. B.Tech, B.Sc)"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              {/* Department */}
              <input
                type="text"
                placeholder="Department / Specialization *"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={nextStep}
              disabled={!formData.fullName || !formData.department}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </>
        )}

        {/* ── Step 2: Year + Field of Interest ── */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">Academic status &amp; interests</h2>
            <p className="text-sm text-slate-500 mb-5">Tell us your year and skill areas</p>

            {/* Year selection */}
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Current Year *</p>
            <div className="space-y-2 mb-6">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`w-full border p-3.5 rounded-lg text-left transition flex items-center gap-3 ${
                    year === y
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-medium text-[#0F172A]">{y}</span>
                  {year === y && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              ))}
            </div>

            {/* Field of Interest / Skill Area */}
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Skill Areas &amp; Interests</p>

            {/* Added interests */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {interests.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeInterest(item)}
                      className="text-blue-400 hover:text-blue-700 font-bold leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="e.g. Web Dev, AI, Finance — press Enter"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleInterestKey}
                className="flex-1 border border-slate-200 text-slate-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={addInterest}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
              >
                Add
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevStep}
                className="w-1/3 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                onClick={finish}
                disabled={!year || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving Profile..." : "Complete Setup"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
