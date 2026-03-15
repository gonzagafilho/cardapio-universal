'use client';

import { useEffect, useRef, useState } from 'react';

const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const PWA_IOS_INSTALL_DISMISSED_KEY = 'pwa-ios-install-dismissed';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

function getPlatformLabel(): string {
  if (isIOS()) return 'iOS';
  if (isAndroid()) return 'Android';
  return 'other';
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [dontShowIosAgain, setDontShowIosAgain] = useState(false);
  const [showAndroidFallback, setShowAndroidFallback] = useState(false);
  const beforeInstallFiredRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const standalone = isStandalone();
    const platform = getPlatformLabel();
    const iosDismissed = (() => {
      try {
        return localStorage.getItem(PWA_IOS_INSTALL_DISMISSED_KEY) === '1';
      } catch {
        return false;
      }
    })();
    const androidDismissed = (() => {
      try {
        const v = localStorage.getItem(PWA_INSTALL_DISMISSED_KEY);
        if (!v) return false;
        const t = parseInt(v, 10);
        return !isNaN(t) && Date.now() - t < 7 * 24 * 60 * 60 * 1000;
      } catch {
        return false;
      }
    })();
    console.debug('[PWA]', {
      platform,
      standalone,
      iosDismissed,
      androidDismissed,
      msg: 'init',
    });
    if (standalone) return;

    if (isIOS()) {
      if (iosDismissed) {
        console.debug('[PWA] iOS banner hidden: localStorage dismiss');
        return;
      }
      console.debug('[PWA] iOS banner eligible, showing prompt');
      setShowIosPrompt(true);
      return;
    }

    if (androidDismissed) {
      console.debug('[PWA] Android banner hidden: localStorage dismiss (7d)');
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      beforeInstallFiredRef.current = true;
      console.debug('[PWA] beforeinstallprompt received, deferredPrompt set');
      setDeferredPrompt(e as InstallPromptEvent);
      setShowBanner(true);
      setShowAndroidFallback(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    if (isAndroid()) {
      const fallbackTimer = setTimeout(() => {
        if (!beforeInstallFiredRef.current) setShowAndroidFallback(true);
      }, 3000);
      return () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  useEffect(() => {
    const bannerShown =
      (showBanner && !!deferredPrompt) || showIosPrompt || showAndroidFallback;
    console.debug('[PWA]', {
      deferredPromptExists: !!deferredPrompt,
      showBanner,
      showIosPrompt,
      showAndroidFallback,
      bannerExibido: bannerShown,
    });
  }, [deferredPrompt, showBanner, showIosPrompt, showAndroidFallback]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowBanner(false);
    } catch {
      /* ignore */
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const handleAndroidFallbackDismiss = () => {
    setShowAndroidFallback(false);
    try {
      localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const handleIosInstallClick = () => {
    setShowIosModal(true);
  };

  const handleIosModalClose = () => {
    if (dontShowIosAgain) {
      try {
        localStorage.setItem(PWA_IOS_INSTALL_DISMISSED_KEY, '1');
      } catch {
        /* ignore */
      }
      setShowIosPrompt(false);
    }
    setShowIosModal(false);
  };

  if (showIosModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <div
          className="w-full max-w-sm rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-100 p-4">
            <h2 id="ios-install-title" className="text-lg font-semibold text-gray-900">
              Instalar no iPhone
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Siga os passos abaixo para adicionar o cardápio à tela de início.
            </p>
          </div>
          <ol className="list-inside list-decimal space-y-3 p-4 text-sm text-gray-700">
            <li>Toque em <strong>Compartilhar</strong> (ícone na barra do Safari)</li>
            <li>Toque em <strong>Adicionar à Tela de Início</strong></li>
            <li>Toque em <strong>Adicionar</strong></li>
          </ol>
          <div className="space-y-3 border-t border-gray-100 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={dontShowIosAgain}
                onChange={(e) => setDontShowIosAgain(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Não mostrar novamente
            </label>
            <button
              type="button"
              onClick={handleIosModalClose}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showIosPrompt) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-sm sm:rounded-xl"
        role="region"
        aria-label="Instalar aplicativo no iPhone"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-800">
            Instale o cardápio no seu iPhone para acessar mais rápido.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(PWA_IOS_INSTALL_DISMISSED_KEY, '1');
                } catch {
                  /* ignore */
                }
                setShowIosPrompt(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Agora não
            </button>
            <button
              type="button"
              onClick={handleIosInstallClick}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Instalar app
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAndroidFallback) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-sm sm:rounded-xl"
        role="region"
        aria-label="Instalar aplicativo (menu do navegador)"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-800">
            Para instalar: abra o menu <span className="font-semibold">⋮</span> do navegador e escolha &quot;Adicionar à tela inicial&quot; ou &quot;Instalar app&quot;.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAndroidFallbackDismiss}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-sm sm:rounded-xl"
      role="region"
      aria-label="Instalar aplicativo"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-800">
          Instale o cardápio para acessar mais rápido.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {installing ? '…' : 'Instalar'}
          </button>
        </div>
      </div>
    </div>
  );
}
