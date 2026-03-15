import type { Metadata, Viewport } from 'next';
import { CartProvider } from '@/contexts';
import { PwaSwRegister } from '@/components/PwaSwRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cardápio Digital',
  description: 'Cardápio digital multi-empresa',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cardápio',
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <PwaSwRegister />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
