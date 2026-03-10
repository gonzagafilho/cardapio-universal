import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { APP_HOST } from '@/lib/constants';
import { CustomDomainCartPage } from '@/components/store/CustomDomainCartPage';

export default async function CartPage() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (!host || host === APP_HOST) {
    redirect('/');
  }
  return <CustomDomainCartPage host={host} />;
}
