'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import ImageModal from '@/components/ImageModal';
import toast from 'react-hot-toast';

interface GigDetail {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  gig_skills?: { skill_name: string }[];
}

interface ExistingSolution {
  id: string;
  answer: string;
  submitted_at: string;
}

export default function SolvePage() {
  const router = useRouter();
  const params = useParams();
  const gigId = params.gigId as string;

  const { user, loading: authLoading, isAuthenticated, isRegistered } = useAuth();

  const [gig, setGig] = useState<GigDetail | null>(null);
  const [existing, setExisting] = useState<ExistingSolution | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) { router.push('/'); return; }
      if (!isRegistered)    { router.push('/register'); return; }
    }
  }, [authLoading, isAuthenticated, isRegistered, router]);

  useEffect(() => {
    if (!user || !gigId) return;
    loadData();
  }, [user, gigId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load gig details
      const { data: gigData, error: gigError } = await supabase
        .from('gigs')
        .select('id, title, description, image_url, status, created_at, gig_skills(skill_name)')
        .eq('id', gigId)
        .single();

      if (gigError || !gigData) {
        toast.error('Gig not found');
        router.push('/dashboard');
        return;
      }
      setGig(gigData);

      // 2. Check user is accepted applicant
      const { data: appData } = await supabase
        .from('applications')
        .select('id, status')
        .eq('gig_id', gigId)
        .eq('applicant_id', user!.id)
        .single();

      if (!appData || appData.status !== 'accepted') {
        toast.error("You're not an accepted applicant for this gig.");
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);

      // 3. Check for existing solution
      const { data: solData } = await supabase
        .from('solutions')
        .select('id, answer, submitted_at')
        .eq('gig_id', gigId)
        .eq('user_id', user!.id)
        .single();

      if (solData) {
        setExisting(solData);
        setAnswer(solData.answer || '');
      }
    } catch (err) {
      console.error('Solve page load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('Please write your answer first.'); return; }
    if (!user) return;

    setSubmitting(true);
    try {
      const isNewSubmission = !existing;

      if (existing) {
        // Update existing solution
        const { error } = await supabase
          .from('solutions')
          .update({ answer: answer.trim(), submitted_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
        toast.success('Answer updated!');
        setExisting((prev) => prev ? { ...prev, answer: answer.trim() } : prev);
      } else {
        // Insert new solution
        const { data, error } = await supabase
          .from('solutions')
          .insert([{ gig_id: gigId, user_id: user.id, answer: answer.trim() }])
          .select()
          .single();
        if (error) throw error;
        toast.success('Answer submitted!');
        setExisting(data);
      }

      // Notify gig owner about the new/updated solution
      try {
        const { data: gigOwner } = await supabase
          .from('gigs')
          .select('created_by')
          .eq('id', gigId)
          .single();

        if (gigOwner && gigOwner.created_by !== user.id) {
          await supabase.from('notifications').insert([
            {
              user_id: gigOwner.created_by,
              title: isNewSubmission ? 'New Solution Submitted' : 'Solution Updated',
              message: isNewSubmission
                ? `Someone submitted a solution to your gig "${gig?.title}".`
                : `A solver updated their answer on your gig "${gig?.title}".`,
              link: `/my-gigs`,
            },
          ]);
        }
      } catch (notifErr) {
        // Don't block the user if notification insert fails
        console.warn('Failed to create owner notification:', notifErr);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!authorized || !gig) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Solve Gig</span>
            <h1 className="text-xl font-bold text-[#0F172A] mt-1 leading-snug">{gig.title}</h1>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-800 transition"
          >
            ← Back
          </button>
        </div>

        {/* Gig Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          {gig.image_url && (
            <img
              src={gig.image_url}
              alt={gig.title}
              className="w-full max-h-52 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition"
              onClick={() => setZoomedImage(gig.image_url!)}
            />
          )}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{gig.description}</p>
          </div>

          {gig.gig_skills && gig.gig_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {gig.gig_skills.map((s, i) => (
                  <span key={i} className="text-[13px] bg-indigo-50 text-slate-800 px-3 py-1 rounded-full font-medium">
                    {s.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Already submitted banner */}
        {existing && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Answer submitted</p>
              <p className="text-xs text-green-600 mt-0.5">
                Last updated {new Date(existing.submitted_at).toLocaleString()}. You can update it below.
              </p>
            </div>
          </div>
        )}

        {/* Answer textarea */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#0F172A]">
            Your Answer / Solution
          </label>
          <textarea
            rows={10}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your solution here. Explain your approach, include code snippets if needed, and describe the outcome..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-y"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{answer.trim().length} characters</p>
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {submitting ? 'Submitting…' : existing ? 'Update Answer' : 'Submit Answer'}
            </button>
          </div>
        </div>

      </div>

      {zoomedImage && <ImageModal image={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </div>
  );
}
