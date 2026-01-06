import { filterFutureEvents } from '../event-utils';
import { Event } from '../../types';

describe('event-utils', () => {
  describe('filterFutureEvents', () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Past Event',
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        type: 'training',
        boatSize: 'standard',
        canisterCount: 0,
        attendance: {},
        guests: []
      },
      {
        id: '2',
        title: 'Future Event',
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        type: 'training',
        boatSize: 'standard',
        canisterCount: 0,
        attendance: {},
        guests: []
      },
      {
        id: '3',
        title: 'Today Event',
        date: new Date().toISOString(), // Today (now)
        type: 'training',
        boatSize: 'standard',
        canisterCount: 0,
        attendance: {},
        guests: []
      }
    ];

    it('should filter out events strictly in the past (yesterday or older)', () => {
      const result = filterFutureEvents(mockEvents);
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(expect.arrayContaining(['2', '3']));
      expect(result.map(e => e.id)).not.toContain('1');
    });

    it('should return empty array if all events are in the past', () => {
        const pastEvents = [mockEvents[0]];
        const result = filterFutureEvents(pastEvents);
        expect(result).toHaveLength(0);
    });

    it('should return all events if all are in future', () => {
        const futureEvents = [mockEvents[1]];
        const result = filterFutureEvents(futureEvents);
        expect(result).toHaveLength(1);
    });
  });
});
