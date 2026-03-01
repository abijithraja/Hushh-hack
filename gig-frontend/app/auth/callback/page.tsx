'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for authorization code in URL (PKCE flow)
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            router.replace('/');
            return;
          }
        }

        // Check if we now have a session (covers both PKCE and implicit flow)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('Auth callback session error:', sessionError.message);
          router.replace('/');
          return;
        }

        if (session) {
          router.replace('/dashboard');
          return;
        }

        // If no session yet, wait for auth state change (e.g., hash fragment flow)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              router.replace('/dashboard');
            }
          }
        );

        // Timeout fallback - redirect to login if nothing happens
        setTimeout(() => {
          subscription.unsubscribe();
          router.replace('/');
        }, 10000);
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-slate-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
