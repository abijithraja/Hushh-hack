'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /home redirects to /dashboard (all real content lives there)
export default function HomePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard'); }, [router]);
  return null;
}
