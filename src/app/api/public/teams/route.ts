import { NextResponse } from 'next/server';
import { getPublicTeams } from '@/app/actions/public';

/**
 * Public API endpoint to fetch teams that opted-in to be displayed.
 * Uses the shared getPublicTeams() function to avoid code duplication.
 */
export async function GET() {
  try {
    const teams = await getPublicTeams();
    return NextResponse.json(teams);
  } catch (error) {
    // Only log in development to avoid exposing sensitive information in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to fetch public teams:', error);
    }
    return NextResponse.json([], { status: 500 });
  }
}
