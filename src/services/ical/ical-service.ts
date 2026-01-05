import prisma from '@/lib/prisma';
import ical from 'node-ical';

export async function syncTeamEvents(teamId: string): Promise<{ success: boolean; count: number }> {
  // 1. Get Team iCal URL
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { icalUrl: true }
  });

  if (!team?.icalUrl) {
    throw new Error("No iCal URL found for team");
  }

  // 2. Fetch and Parse iCal
  const events = await ical.async.fromURL(team.icalUrl);
  
  let count = 0;

  // 3. Iterate and Upsert
  for (const event of Object.values(events)) {
    if (event.type === 'VEVENT') {
      const vevent = event as ical.VEvent;
      
      const title = vevent.summary;
      const date = vevent.start; // node-ical returns Date object
      const uid = vevent.uid;
      
      if (!title || !date || !uid) continue;

      // Basic mapping
      await prisma.event.upsert({
        where: {
          teamId_externalUid: {
            teamId,
            externalUid: uid
          }
        },
        create: {
          teamId,
          title: title,
          date: date,
          externalUid: uid,
          type: 'training', // Default per requirement
          boatSize: 'standard', // Default
        },
        update: {
          title: title,
          date: date,
          // We update time and title if they changed in the source
        }
      });
      count++;
    }
  }

  return { success: true, count };
}
