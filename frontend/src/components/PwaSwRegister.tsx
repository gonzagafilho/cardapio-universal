'use client';

import { useEffect } from 'react';

/** Registra o Service Worker globalmente. Não exibe CTA de instalação. */
export function PwaSwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
