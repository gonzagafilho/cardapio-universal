import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { APP_HOST } from '@/lib/constants';
import { CustomDomainFailurePage } from '@/components/store/CustomDomainFailurePage';

export default async function FailurePage() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (!host || host === APP_HOST) redirect('/');
  return <CustomDomainFailurePage host={host} />;
}
