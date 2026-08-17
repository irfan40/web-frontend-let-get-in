'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppliedJobsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/resume?tab=overview');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-ink-soft">Redirecting to your My Jobs workspace...</p>
      </div>
    </div>
  );
}
