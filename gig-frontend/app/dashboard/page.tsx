"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { gigApi, leaderboardApi } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { DBGig, supabase } from "@/lib/supabase";
import ImageModal from "@/components/ImageModal";

interface GigWithCreator extends DBGig {
  creator?: {
    full_name: string;
    department: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, isAuthenticated, isRegistered } = useAuth();
  const [gigs, setGigs] = useState<GigWithCreator[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }
      if (!isRegistered) {
        router.push("/register");
        return;
      }
    }
  }, [authLoading, isAuthenticated, isRegistered, router]);

  useEffect(() => {
    if (isAuthenticated && isRegistered) {
      loadData();
    }
  }, [isAuthenticated, isRegistered]);

  // ── Realtime: gigs + leaderboard ──
  useEffect(() => {
    if (!isAuthenticated || !isRegistered) return;

    const gigsChannel = supabase
      .channel("gigs-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "gigs" }, () => {
        loadGigs();
      })
      .subscribe();

    const leaderboardChannel = supabase
      .channel("leaderboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        loadLeaderboard();
      })
      .subscribe();

    const applicationsChannel = supabase
      .channel("dashboard-applications-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        loadGigs(); // re-fetch gigs so status changes (open → in_progress) appear instantly
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gigsChannel);
      supabase.removeChannel(leaderboardChannel);
      supabase.removeChannel(applicationsChannel);
    };
  }, [isAuthenticated, isRegistered]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGigs = async () => {
    try {
      const gigsData = await gigApi.getAll();
      if (gigsData) {
        setGigs(gigsData);
      } else {
        const { data } = await supabase
          .from("gigs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        setGigs(data || []);
      }
    } catch (error) {
      console.error("Error loading gigs:", error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await leaderboardApi.getTop(3);
      if (leaderboardData) {
        setLeaderboard(leaderboardData);
      } else {
        const { data } = await supabase
          .from("users")
          .select("id, full_name, department, year, skill_score")
          .order("skill_score", { ascending: false })
          .limit(3);
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoadingGigs(true);
      await Promise.all([loadGigs(), loadLeaderboard()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingGigs(false);
    }
  };

  const handleApply = async (gigId: string) => {
    try {
      await gigApi.apply(gigId);
      toast.success("Applied successfully!");
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Failed to apply. You may have already applied.");
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Derive display data from user metadata (since profile fetching is disabled)
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayDepartment = profile?.department || 'Not set';
  const displayYear = profile?.year || '—';
  const displayScore = profile?.skill_score || 0;

  // Use real gigs only — no dummy fallback
  const displayGigs = gigs;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 p-5">

        {/* LEFT PANEL */}
        <div className="hidden md:block col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-14 bg-[#0F172A]"></div>
            <div className="px-4 pb-5 -mt-7">
              <div className="w-14 h-14 rounded-xl bg-slate-200 border-4 border-white flex items-center justify-center text-xl font-bold text-slate-600">
                {displayName?.charAt(0)?.toUpperCase()}
              </div>
              <h3 className="font-semibold text-[#0F172A] mt-2 text-sm">{displayName}</h3>
              <p className="text-xs text-slate-500">{displayDepartment}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">SkillScore</span>
                  <span className="font-bold text-[#0F172A]">{displayScore}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Year</span>
                  <span className="font-bold text-[#0F172A]">{displayYear}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Navigate</p>
            <div className="space-y-1">
              {[
                { label: 'Leaderboard', path: '/leaderboard' },
                { label: 'My Profile', path: '/profile' },
                { label: 'My Gigs', path: '/my-gigs' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="w-full text-left text-sm text-slate-700 hover:text-blue-600 py-1.5 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER FEED */}
        <div className="col-span-1 md:col-span-2 space-y-4">

          {/* Post Input */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <button
              onClick={() => router.push('/post')}
              className="w-full text-left px-4 py-2.5 border border-slate-200 rounded-lg text-slate-400 text-sm hover:bg-slate-50 transition"
            >
              Post a new gig or collaboration request...
            </button>
          </div>

          {/* Welcome Banner */}
          <div className="bg-[#0F172A] rounded-xl p-5">
            <p className="text-slate-400 text-xs mb-1">Welcome back,</p>
            <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-slate-400 text-sm">
              You have <span className="text-blue-400 font-medium">{displayGigs.filter(g => g.status === 'open').length} open gigs</span> available to help with.
            </p>
          </div>

          {/* Gigs Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Available Gigs</h3>
              <button className="text-xs text-blue-600 hover:underline">View all</button>
            </div>

            {loadingGigs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : displayGigs.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-10 text-center">
                <p className="text-slate-400 text-sm">No gigs available yet.</p>
                <button
                  onClick={() => router.push('/post')}
                  className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                >
                  + Post the first gig
                </button>
              </div>
            ) : (
            <div className="space-y-3">
              {displayGigs.map((gig) => (
                <div key={gig.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-200 transition-colors">
                  {gig.image_url && (
                    <img
                      src={gig.image_url}
                      alt={gig.title}
                      className="w-full h-40 object-cover rounded-lg mb-3 cursor-zoom-in hover:opacity-90 transition"
                      onClick={() => setZoomedImage(gig.image_url!)}
                    />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#0F172A] text-sm">{gig.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ml-2 shrink-0 ${
                      gig.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {gig.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 mb-3 leading-relaxed">{gig.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded font-medium">
                        +10 pts
                      </span>
                    </div>
                    {gig.status === 'open' && gig.created_by !== user?.id && (
                      <button 
                        onClick={() => handleApply(gig.id)}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        I Can Help
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden md:block col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Contributors</p>
            <div className="space-y-3">
              {leaderboard.length > 0 ? leaderboard.map((c: any, idx: number) => {
                const badgeColor = idx === 0 ? 'bg-[#FFD700] text-[#111]' : idx === 1 ? 'bg-[#C0C0C0] text-[#111]' : idx === 2 ? 'bg-[#CD7F32] text-white' : 'bg-slate-200 text-slate-600';
                return (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${badgeColor}`}>{idx + 1}</div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                    {c.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{c.full_name}</p>
                    <p className="text-xs text-slate-400">{c.skill_score} pts</p>
                  </div>
                </div>
                );
              }) : (
                <p className="text-xs text-slate-400 text-center py-2">No data yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Trending Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {['React', 'Python', 'Node.js', 'System Design', 'DSA', 'AWS'].map((skill) => (
                <span key={skill} className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs rounded cursor-pointer transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Info</p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="font-medium text-slate-800 text-right max-w-[140px] truncate">{displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="font-medium text-slate-800 text-right max-w-[140px] truncate">{displayEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department</span>
                <span className="font-medium text-slate-800">{displayDepartment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Year</span>
                <span className="font-medium text-slate-800">{displayYear}</span>
              </div>
              <div className="flex justify-between pt-1 mt-1">
                <span className="text-slate-400">SkillScore</span>
                <span className="font-bold text-blue-600">{displayScore} pts</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {zoomedImage && <ImageModal image={zoomedImage} onClose={() => setZoomedImage(null)} />}

      {/* Floating FAB (Mobile) */}
      <button
        onClick={() => router.push('/post')}
        className="fixed bottom-6 right-6 md:hidden bg-blue-600 text-white w-12 h-12 rounded-xl text-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center font-bold"
      >
        +
      </button>
    </div>
  );
}
