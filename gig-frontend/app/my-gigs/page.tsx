'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { gigApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageModal from '@/components/ImageModal';
import toast from 'react-hot-toast';

interface GigSkill { skill_name: string; }
interface Applicant { id: string; full_name: string; department: string; skills: string[] | null; }
interface Application { id: string; status: string; applicant: Applicant; }
interface Solver { id: string; full_name: string; department: string; }
interface Solution { id: string; answer: string; submitted_at: string; solver: Solver; }
interface Gig {
  id: string; title: string; description: string; status: string;
  image_url: string | null; created_at: string;
  gig_skills?: GigSkill[];
  applications?: Application[];
  solutions?: Solution[];
}

function matchPercent(userSkills: string[] | null, gigSkills: GigSkill[]): number {
  if (!gigSkills || gigSkills.length === 0) return 0;
  if (!userSkills || userSkills.length === 0) return 0;
  const lower = userSkills.map(s => s.toLowerCase());
  const matched = gigSkills.filter(g => lower.includes(g.skill_name.toLowerCase())).length;
  return Math.round((matched / gigSkills.length) * 100);
}

export default function MyGigsPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated, isRegistered, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posted' | 'accepted'>('posted');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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

  useEffect(() => {
    if (isAuthenticated && isRegistered) {
      loadGigs();
    }
  }, [isAuthenticated, isRegistered]);

  // ── Realtime: gigs + applications live ──
  useEffect(() => {
    if (!isAuthenticated || !isRegistered || !user) return;

    const gigsChannel = supabase
      .channel('my-gigs-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gigs', filter: `created_by=eq.${user.id}` },
        () => { loadGigs(); }
      )
      .subscribe();

    const appsChannel = supabase
      .channel('my-applications-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => { loadGigs(); }
      )
      .subscribe();

    const solutionsChannel = supabase
      .channel('my-solutions-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solutions' },
        () => { loadGigs(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gigsChannel);
      supabase.removeChannel(appsChannel);
      supabase.removeChannel(solutionsChannel);
    };
  }, [isAuthenticated, isRegistered, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGigs = async () => {
    try {
      setLoadingGigs(true);
      const data = await gigApi.getMyGigs();
      setGigs(data || []);
    } catch (error) {
      console.error("Error loading gigs:", error);
    } finally {
      setLoadingGigs(false);
    }
  };

  const handleComplete = async (gigId: string, userId: string) => {
    try {
      await gigApi.complete(gigId, userId);
      toast.success("Gig complete! Skill points awarded.");
      loadGigs();
    } catch (error) {
      console.error("Error completing gig:", error);
      toast.error("Failed to complete gig.");
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      await gigApi.acceptApplication(applicationId);
      toast.success("Application accepted!");
      loadGigs();
    } catch (error) {
      console.error("Error accepting application:", error);
      toast.error("Failed to accept application.");
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  const postedGigs = gigs;

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">My Gigs</h1>
          <p className="text-gray-600">Manage gigs you&apos;ve posted</p>
        </div>

        {/* Gig list */}
        {loadingGigs ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : postedGigs.length > 0 ? (
          <div className="space-y-4">
            {postedGigs.map(gig => (
              <div key={gig.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{gig.title}</h3>
                    <p className="text-sm text-gray-500">
                      Posted {new Date(gig.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    gig.status === 'open' ? 'bg-green-100 text-green-700' :
                    gig.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {gig.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{gig.description}</p>
                
                {gig.image_url && (
                  <img
                    src={gig.image_url}
                    alt={gig.title}
                    className="w-full max-h-48 object-cover rounded-lg mb-4 cursor-zoom-in hover:opacity-90 transition"
                    onClick={() => setZoomedImage(gig.image_url!)}
                  />
                )}

                {/* Solutions section */}
                {gig.solutions && gig.solutions.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Solutions ({gig.solutions.length})
                    </p>
                    <div className="space-y-3">
                      {gig.solutions.map((sol) => (
                        <div key={sol.id} className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{sol.solver?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{sol.solver?.department}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(sol.submitted_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{sol.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications section */}
                {gig.applications && gig.applications.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Applications ({gig.applications.length})
                    </p>
                    <div className="space-y-3">
                      {gig.applications.map((app) => {
                        const match = matchPercent(app.applicant?.skills, gig.gig_skills || []);
                        const hasRequiredSkills = (gig.gig_skills || []).length > 0;
                        return (
                          <div key={app.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{app.applicant?.full_name}</p>
                                <p className="text-xs text-gray-500">{app.applicant?.department}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                  app.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>{app.status}</span>
                                {app.status === 'pending' && gig.status === 'open' && (
                                  <button
                                    onClick={() => handleAcceptApplication(app.id)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                  >Accept</button>
                                )}
                                {app.status === 'accepted' && gig.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleComplete(gig.id, app.applicant?.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                  >Mark Complete</button>
                                )}
                              </div>
                            </div>

                            {/* Applicant skill tags */}
                            {app.applicant?.skills && app.applicant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {app.applicant.skills.map((skill, i) => {
                                  const required = (gig.gig_skills || []).map(g => g.skill_name.toLowerCase());
                                  const isMatch = required.includes(skill.toLowerCase());
                                  return (
                                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      isMatch ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500'
                                    }`}>{skill}</span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Match bar */}
                            {hasRequiredSkills && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] text-gray-400">Skill match</span>
                                  <span className={`text-[11px] font-semibold ${
                                    match >= 75 ? 'text-green-600' : match >= 40 ? 'text-amber-500' : 'text-red-500'
                                  }`}>{match}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      match >= 75 ? 'bg-green-500' : match >= 40 ? 'bg-amber-400' : 'bg-red-400'
                                    }`}
                                    style={{ width: `${match}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No gigs posted yet"
            description="You haven't posted any gigs yet. Start by creating your first gig!"
            actionLabel="Post a Gig"
            onAction={() => router.push('/post')}
          />
        )}
      </div>
      {zoomedImage && <ImageModal image={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </div>
  );
}
