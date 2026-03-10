import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { APP_HOST } from '@/lib/constants';
import { CustomDomainCheckoutPage } from '@/components/store/CustomDomainCheckoutPage';

export default async function CheckoutPage() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (!host || host === APP_HOST) redirect('/');
  return <CustomDomainCheckoutPage host={host} />;
}
