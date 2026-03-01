'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated, isRegistered, user } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      if (!isRegistered) {
        router.push('/register');
        return;
      }
    }
  }, [authLoading, isAuthenticated, isRegistered, router]);

  const displayName    = profile?.full_name    || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail   = profile?.email        || user?.email || '';
  const displayDept    = profile?.department   || 'Not set';
  const displayYear    = profile?.year         || '—';
  const displayScore   = profile?.skill_score  ?? 0;
  const displayAbout   = profile?.about        || null;
  const displayMobile  = profile?.mobile       || null;
  const displayDob     = profile?.dob          || null;
  const displayAddress = profile?.address      || null;
  const displayInst    = profile?.institution  || null;
  const displayDegree  = profile?.degree       || null;
  const memberSince    = profile?.created_at   || user?.created_at || new Date().toISOString();
  const skills: string[] = profile?.skills     || [];
  const initials       = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Cover banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />

          <div className="px-6 pb-6">
            {/* Avatar + Edit button row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                {initials}
              </div>
              <Link
                href="/profile/edit"
                className="mb-1 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-1.5 rounded-lg transition"
              >
                Edit Profile
              </Link>
            </div>

            <h1 className="text-xl font-bold text-[#0F172A]">{displayName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{displayDept} • {displayYear}</p>
            {displayAbout && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{displayAbout}</p>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{displayScore}</p>
            <p className="text-xs text-slate-500 mt-1">SkillScore</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm font-bold text-slate-800 truncate">{displayDept}</p>
            <p className="text-xs text-slate-500 mt-1">Department</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm font-bold text-slate-800">{displayYear}</p>
            <p className="text-xs text-slate-500 mt-1">Year</p>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Skills</h2>
            <Link href="/profile/edit" className="text-xs text-blue-600 hover:underline">+ Add skill</Link>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="bg-indigo-50 text-slate-800 text-[13px] font-medium px-3 py-1.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No skills added yet. <Link href="/profile/edit" className="text-blue-600 hover:underline">Add some →</Link></p>
          )}
        </div>

        {/* ── Account Info ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Email',        value: displayEmail },
              { label: 'Full Name',    value: displayName  },
              { label: 'Department',   value: displayDept  },
              { label: 'Year',         value: displayYear  },
              { label: 'Member Since', value: new Date(memberSince).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Personal Details ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Personal Details</h2>
            <Link href="/profile/edit" className="text-xs text-blue-600 hover:underline">Edit →</Link>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Mobile',       value: displayMobile,  icon: 'phone' },
              { label: 'Date of Birth', value: displayDob ? new Date(displayDob).toLocaleDateString() : null, icon: 'calendar' },
              { label: 'Address',       value: displayAddress, icon: 'map' },
              { label: 'Institution',   value: displayInst,    icon: 'building' },
              { label: 'Degree',        value: displayDegree,  icon: 'academic' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 text-slate-400 flex-shrink-0">
                    {icon === 'phone' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                    {icon === 'calendar' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    {icon === 'map' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    {icon === 'building' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    {icon === 'academic' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
                  </span>
                  <span className="text-slate-500">{label}</span>
                </div>
                {value ? (
                  <span className="font-medium text-slate-800 text-right max-w-[220px] truncate">{value}</span>
                ) : (
                  <span className="text-slate-300 italic text-xs">Not added</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}