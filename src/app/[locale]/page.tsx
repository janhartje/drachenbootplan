import { setRequestLocale } from 'next-intl/server';
import LandingPageClient from './LandingPageClient';
import { getPublicTeams } from '@/app/actions/public';

/**
 * Landing page server component.
 * Fetches public teams using the shared getPublicTeams() function for consistency.
 */
export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  // Fetch public teams server-side for SEO and performance
  const publicTeams = await getPublicTeams();

  return <LandingPageClient publicTeams={publicTeams} />;
}
