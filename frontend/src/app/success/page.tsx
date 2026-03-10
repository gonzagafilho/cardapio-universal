import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { APP_HOST } from '@/lib/constants';
import { CustomDomainSuccessPage } from '@/components/store/CustomDomainSuccessPage';

export default async function SuccessPage() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (!host || host === APP_HOST) redirect('/');
  return <CustomDomainSuccessPage host={host} />;
}
