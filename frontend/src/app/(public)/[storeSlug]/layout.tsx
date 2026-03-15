import { ReactNode } from 'react';
import { PwaRegister } from '@/components/PwaRegister';

export default function PublicStoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <PwaRegister />
      {children}
    </>
  );
}
