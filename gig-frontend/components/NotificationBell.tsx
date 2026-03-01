'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title?: string;
  message: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

/** Play a short notification chime via Web Audio API (no external file needed) */
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Two-tone chime: 880 Hz → 1320 Hz
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not supported — silent fallback
  }
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const initialFetchDone = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications().then(() => { initialFetchDone.current = true; });

    // Realtime subscription — all events (insert, update, delete)
    const channel = supabase
      .channel('notifications-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          // Prepend new notification directly for instant UI update (no round-trip)
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 20));

          // Only ring + popup after the initial fetch (i.e. for truly new notifications)
          if (initialFetchDone.current) {
            playNotificationSound();
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);

            // Premium dark glass toast popup
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? 'animate-slide-in-right' : 'animate-slide-out-right'
                  } pointer-events-auto w-[360px] rounded-2xl bg-[#111827] shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden cursor-pointer`}
                  onClick={() => {
                    toast.dismiss(t.id);
                    if (newNotif.link) router.push(newNotif.link);
                  }}
                >
                  <div className="p-[18px]">
                    <div className="flex items-start gap-3">
                      {/* Animated bell icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center animate-wiggle">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">
                          {newNotif.title || 'New Notification'}
                        </p>
                        <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{newNotif.message}</p>
                        {newNotif.link && (
                          <p className="text-xs text-blue-400 font-semibold mt-2 flex items-center gap-1">
                            View details <span className="text-[10px]">→</span>
                          </p>
                        )}
                      </div>
                      {/* Close button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
                        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Timestamp */}
                    <p className="text-[10px] text-slate-600 mt-3 text-right">just now</p>
                  </div>
                </div>
              ),
              {
                duration: 6000,
                position: 'top-right',
              }
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => { fetchNotifications(); }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => { fetchNotifications(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications, router]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      // Re-fetch every time the bell is opened so missed realtime events show up
      fetchNotifications();
      if (unreadCount > 0) markAllRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className={`relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ${
          pulse ? 'animate-bounce' : ''
        }`}
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs text-blue-600 font-medium">{unreadCount} new</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.link) { setOpen(false); router.push(n.link); }
                    }}
                    className={`px-4 py-3 text-sm transition-colors ${
                      n.link ? 'cursor-pointer hover:bg-slate-50' : ''
                    } ${n.is_read ? 'text-slate-500' : 'text-slate-800 bg-blue-50/40'}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      {n.is_read && <span className="mt-1.5 w-2 h-2 flex-shrink-0" />}
                      <div>
                        <p>{n.message}</p>
                        {n.link && (
                          <p className="text-xs text-blue-500 mt-0.5 font-medium">Tap to open →</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
