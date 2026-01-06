import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { syncTeamEvents } from '@/services/ical/ical-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Await params
  const { id: teamId } = await params;

  // Verify Team Membership & Role
  const member = await prisma.paddler.findFirst({
        where: {
            teamId: teamId,
            userId: session.user.id,
        },
        select: {
            role: true
        }
    });

  if (!member || member.role !== 'CAPTAIN') {
      return new Response('Forbidden: Captains only', { status: 403 });
  }

  try {
    const result = await syncTeamEvents(teamId);
    return Response.json(result);
  } catch (error) {
    console.error('iCal Sync Error:', error);
    return new Response('Failed to sync events', { status: 500 });
  }
}
