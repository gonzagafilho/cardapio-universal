import { headers } from 'next/headers';
import { CustomDomainStorePage } from '@/components/store';
import { LandingPage } from '@/components/commercial/LandingPage';
import { MenuBasePage } from '@/components/commercial/MenuBasePage';
import { APP_HOST, MENU_BASE_HOST } from '@/lib/constants';

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (MENU_BASE_HOST && host === MENU_BASE_HOST) {
    return <MenuBasePage />;
  }
  if (host && host !== APP_HOST) {
    return <CustomDomainStorePage host={host} />;
  }
  return <LandingPage />;
}
