'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LeaderboardItem from '@/components/LeaderboardItem';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { leaderboardApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LeaderboardUser {
  id: string;
  rank: number;
  full_name: string;
  skill_score: number;
  department: string;
}

const departments = ['All', 'Engineering', 'Design', 'Product', 'Marketing'];

export default function LeaderboardPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated, isRegistered } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

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
      loadLeaderboard();
    }
  }, [isAuthenticated, isRegistered]);

  // ── Realtime: refresh leaderboard on any user change ──
  useEffect(() => {
    if (!isAuthenticated || !isRegistered) return;

    const channel = supabase
      .channel('leaderboard-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => { loadLeaderboard(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, isRegistered]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLeaderboard = async () => {
    try {
      setLoadingData(true);
      const data = await leaderboardApi.getTop(20);
      setLeaderboardData(data || []);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  const filteredData = selectedDepartment === 'All'
    ? leaderboardData
    : leaderboardData.filter(user => user.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See who&apos;s leading in SkillScore across the platform</p>
        </div>

        {/* Department filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filter by Department
          </label>
          <div className="flex flex-wrap gap-2">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loadingData ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredData.length > 0 ? (
            <div>
              {filteredData.map((user, index) => (
                <LeaderboardItem
                  key={user.id || index}
                  rank={user.rank}
                  name={user.full_name || 'Anonymous'}
                  skillScore={user.skill_score}
                  department={user.department || '—'}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No users found"
              description="No users match the selected department filter."
              actionLabel="View All"
              onAction={() => setSelectedDepartment('All')}
            />
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-4xl font-bold text-indigo-600">{leaderboardData.length}</p>
            <p className="text-gray-600 mt-2">Active Users</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-4xl font-bold text-green-600">
              {leaderboardData.reduce((sum, user) => sum + (user.skill_score || 0), 0)}
            </p>
            <p className="text-gray-600 mt-2">Total SkillScore</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-4xl font-bold text-purple-600">
              {leaderboardData.length > 0 
                ? Math.round(leaderboardData.reduce((sum, user) => sum + (user.skill_score || 0), 0) / leaderboardData.length)
                : 0}
            </p>
            <p className="text-gray-600 mt-2">Average Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
