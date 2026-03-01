"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, DBUser } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: DBUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Upsert user profile into the users table from Google OAuth metadata
  const upsertProfile = useCallback(async (user: import("@supabase/supabase-js").User) => {
    const meta = user.user_metadata || {};
    const email = user.email ?? "";

    // Remove any orphaned row with the same email but a different auth id
    // (e.g. user deleted from auth and re-signed-up) to avoid unique constraint
    // violation on users_email_key.
    if (email) {
      await supabase.from("users").delete().eq("email", email).neq("id", user.id);
    }

    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        email,
        full_name: meta.full_name ?? meta.name ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (error) console.warn("Profile upsert:", error.message);
  }, []);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Race against a 4s timeout so a slow DB never blocks the UI
      const result = await Promise.race([
        supabase.from("users").select("*").eq("id", userId).maybeSingle(),
        new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("timeout") }), 4000)
        ),
      ]);
      const { data, error } = result as { data: DBUser | null; error: { code?: string; message?: string } | null };
      if (error) {
        console.warn("Error fetching profile:", error.message);
      }
      return data as DBUser | null;
    } catch (err) {
      console.warn("Error fetching profile:", err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // If the refresh token is stale/revoked, clear the broken session so the
        // user is cleanly signed out instead of stuck in a half-auth state.
        if (sessionError) {
          console.warn('Session recovery failed:', sessionError.message);
          await supabase.auth.signOut().catch(() => {});
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
          return;
        }

        // ⚡ Unblock the UI immediately — getSession() reads from localStorage (fast).
        // Profile is loaded in the background so pages never hang waiting for DB.
        setAuthState({
          user: session?.user ?? null,
          profile: null,
          session: session ?? null,
          loading: false,
          error: null,
        });

        // Fetch profile in background — does NOT block routing
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setAuthState((prev) =>
            prev.user?.id === session.user.id ? { ...prev, profile } : prev
          );
        }
      } catch (err) {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: err instanceof Error ? err.message : "Auth error",
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Unblock immediately, then upsert + fetch profile in background
          setAuthState({
            user: session.user,
            profile: null,
            session,
            loading: false,
            error: null,
          });
          upsertProfile(session.user);
          const profile = await fetchProfile(session.user.id);
          setAuthState((prev) =>
            prev.user?.id === session.user.id ? { ...prev, profile } : prev
          );
        } else if (event === "SIGNED_OUT") {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, upsertProfile]);

  // ── Realtime: keep profile in sync when the user's row changes in DB ──
  useEffect(() => {
    if (!authState.user) return;

    const channel = supabase
      .channel('my-profile-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authState.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            // Row deleted — clear profile
            setAuthState((prev) => ({ ...prev, profile: null }));
          } else {
            // INSERT or UPDATE — use the new row directly (no round-trip)
            setAuthState((prev) => ({ ...prev, profile: payload.new as DBUser }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authState.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sign in with email + password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Reset loading on success — onAuthStateChange will also fire and set user
      setAuthState((prev) => ({ ...prev, loading: false }));
      return data;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Sign in failed",
      }));
      throw err; // re-throw so LoginCard can catch it
    }
  };

  // Sign up with email + password
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      // Immediately create the row in public.users so it exists before the
      // register page tries to update it. Works whether email confirm is on or off.
      if (data.user) {
        const { error: upsertError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: email,
            full_name: fullName || null,
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
        if (upsertError) console.warn("Initial profile upsert:", upsertError.message);
      }

      setAuthState((prev) => ({ ...prev, loading: false }));
      // If session is null, Supabase is waiting for email confirmation
      return { needsConfirmation: !data.session, session: data.session };
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Sign up failed",
      }));
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push("/");
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Sign out failed",
      }));
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (authState.user) {
      const profile = await fetchProfile(authState.user.id);
      setAuthState((prev) => ({ ...prev, profile }));
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
    isAuthenticated: !!authState.user,
    isRegistered: !!authState.user,
  };
}
