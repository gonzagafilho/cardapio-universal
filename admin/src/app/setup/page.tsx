'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import { SetupWizard } from '@/components/setup/SetupWizard';
import { LoadingPage } from '@/components/ui/loading';

const SETUP_BUSINESS_TYPE_KEY = 'nexora_setup_business_type';

export default function SetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [businessType, setBusinessType] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash?.slice(1) || '';
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const bt = params.get('businessType');

    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      if (bt) {
        sessionStorage.setItem(SETUP_BUSINESS_TYPE_KEY, bt);
      }
      window.history.replaceState(null, '', '/setup');
      window.location.reload();
      return;
    }

    try {
      const stored = sessionStorage.getItem(SETUP_BUSINESS_TYPE_KEY) ?? '';
      setBusinessType(stored);
    } catch {
      setBusinessType('');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!user.establishmentId) {
      router.replace('/dashboard');
    }
  }, [hydrated, authLoading, user, router]);

  if (!hydrated || authLoading || !user) {
    return <LoadingPage />;
  }

  if (!user.establishmentId) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <SetupWizard establishmentId={user.establishmentId} initialBusinessType={businessType} />
    </div>
  );
}
