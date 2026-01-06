import { Event } from '@/types';

export const filterFutureEvents = (events: Event[]): Event[] => {
  const now = new Date();
  // Set to start of today to include events happening today
  now.setHours(0, 0, 0, 0);

  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });
};
