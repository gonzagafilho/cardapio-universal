import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { APP_HOST } from '@/lib/constants';
import { CustomDomainOrderPage } from '@/components/store/CustomDomainOrderPage';

export default async function OrderPage({ params }: { params: { id: string } }) {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (!host || host === APP_HOST) redirect('/');
  return <CustomDomainOrderPage host={host} orderId={params.id} />;
}
