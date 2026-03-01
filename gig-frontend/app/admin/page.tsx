'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [metrics] = useState({
    totalUsers: 247,
    totalGigs: 156,
    completedGigs: 89,
    proofCardsGenerated: 89,
    averageSkillScore: 185,
    activeUsers: 198,
    gigsThisWeek: 23,
    completionRate: 57,
  });

  const [recentActivity] = useState([
    { id: 1, type: 'gig_completed', message: 'SQL Database Optimization completed by Emma Davis', time: '2 minutes ago' },
    { id: 2, type: 'user_joined', message: 'New user Frank Miller joined', time: '15 minutes ago' },
    { id: 3, type: 'gig_posted', message: 'New gig posted: React Native App Development', time: '1 hour ago' },
    { id: 4, type: 'gig_completed', message: 'UI Design Review completed by Bob Smith', time: '2 hours ago' },
    { id: 5, type: 'proof_generated', message: 'Proof card generated for Alice Johnson', time: '3 hours ago' },
  ]);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if already authorized (in real app, would be JWT token)
    const authorized = sessionStorage.getItem('adminAuthorized');
    if (authorized === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, this would be proper authentication)
    if (password === 'admin123') {
      setIsAuthorized(true);
      sessionStorage.setItem('adminAuthorized', 'true');
    } else {
      toast.error('Invalid password');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Access</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
            <p className="mt-4 text-xs text-gray-500 text-center">
              Demo password: admin123
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              setIsAuthorized(false);
              sessionStorage.removeItem('adminAuthorized');
            }}
            className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-600 text-sm mt-2">↑ {metrics.activeUsers} active</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Gigs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalGigs}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-green-600 text-sm mt-2">+{metrics.gigsThisWeek} this week</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed Gigs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.completedGigs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-600 text-sm mt-2">{metrics.completionRate}% completion rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Proof Cards</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.proofCardsGenerated}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-2">Generated</p>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Average SkillScore</span>
                <span className="text-xl font-bold text-indigo-600">{metrics.averageSkillScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">User Engagement</span>
                <span className="text-xl font-bold text-green-600">
                  {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Gig Completion Rate</span>
                <span className="text-xl font-bold text-purple-600">{metrics.completionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Gigs per User</span>
                <span className="text-xl font-bold text-yellow-600">
                  {(metrics.totalGigs / metrics.totalUsers).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Export User Data
            </button>
            <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Generate Report
            </button>
            <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
