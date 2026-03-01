'use client';

import { useEffect, useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Data Science', 'Business', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Working Professional'];

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated, isRegistered, user, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    full_name:   '',
    department:  '',
    year:        '',
    about:       '',
    skills:      [] as string[],
    mobile:      '',
    dob:         '',
    address:     '',
    institution: '',
    degree:      '',
  });

  // Pre-fill once profile loads
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) { router.push('/'); return; }
      if (!isRegistered)    { router.push('/register'); return; }
    }
    if (profile) {
      setForm({
        full_name:   profile.full_name   || '',
        department:  profile.department  || '',
        year:        profile.year        || '',
        about:       profile.about       || '',
        skills:      profile.skills      || [],
        mobile:      profile.mobile      || '',
        dob:         profile.dob         || '',
        address:     profile.address     || '',
        institution: profile.institution || '',
        degree:      profile.degree      || '',
      });
    }
  }, [authLoading, isAuthenticated, isRegistered, profile, router]);

  // ── Skill helpers ──
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (form.skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    setForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  // ── Save ──
  const handleSave = async () => {
    if (!user) return;
    if (!form.full_name.trim()) { toast.error('Name is required'); return; }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name:   form.full_name.trim(),
          department:  form.department || null,
          year:        form.year       || null,
          about:       form.about.trim() || null,
          skills:      form.skills,
          mobile:      form.mobile.trim() || null,
          dob:         form.dob || null,
          address:     form.address.trim() || null,
          institution: form.institution.trim() || null,
          degree:      form.degree.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated!');
      await refreshProfile?.();
      router.push('/profile');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Edit Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">Update your info and skills</p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="text-sm text-slate-500 hover:text-slate-800 transition"
          >
            ← Back
          </button>
        </div>

        {/* ── Basic Info ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Basic Info</h2>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Full Name *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your full name"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">About / Bio</label>
            <textarea
              value={form.about}
              onChange={e => setForm(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Tell others what you're working on or interested in..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Year</label>
              <select
                value={form.year}
                onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
              >
                <option value="">Select year</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Personal Details ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Personal Details</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={e => setForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="+91 9876543210"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={e => setForm(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Your city or full address"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Institution</label>
              <input
                type="text"
                value={form.institution}
                onChange={e => setForm(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="e.g. MIT, Stanford"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Degree</label>
              <input
                type="text"
                value={form.degree}
                onChange={e => setForm(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g. B.Tech, M.Sc"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Skills</h2>

          {/* Existing skill tags */}
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map(skill => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-blue-400 hover:text-blue-700 leading-none font-bold ml-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKey}
              placeholder="e.g. React, UI Design, Python — press Enter to add"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <button
              onClick={addSkill}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition whitespace-nowrap"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-slate-400">Press Enter or comma to quickly add a skill.</p>
        </div>

        {/* ── Save / Cancel ── */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium py-3 rounded-xl transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
