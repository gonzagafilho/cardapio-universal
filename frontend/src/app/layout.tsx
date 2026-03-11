import type { Metadata } from 'next';
import { CartProvider } from '@/contexts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cardápio Digital',
  description: 'Cardápio digital multi-empresa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
