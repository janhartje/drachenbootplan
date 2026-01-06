import { NextRequest } from 'next/server';
import pLimit from 'p-limit';
import prisma from '@/lib/prisma';
import { syncTeamEvents } from '@/services/ical/ical-service';

export async function GET(req: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find teams with iCal URL
  const teams = await prisma.team.findMany({
    where: {
      icalUrl: {
        not: null
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  // Sync in parallel with Promise.allSettled to ensure one failure doesn't stop others
  // Sync in parallel with limit to ensure database safety
  const limit = pLimit(5);
  const promises = teams.map((team) => limit(async () => {
    try {
      const result = await syncTeamEvents(team.id);
      return { team: team.name, ...result };
    } catch (error) {
       console.error(`Failed to sync team ${team.name}:`, error);
       return { team: team.name, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }));

  const results = await Promise.all(promises);

  return Response.json({ success: true, results });
}
