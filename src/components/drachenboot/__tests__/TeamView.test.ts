import { filterAndSortPaddlers, sortPaddlersForEvents } from '@/utils/paddlerFilters';
import { Paddler } from '@/types';

describe('sortPaddlersForEvents', () => {
  const paddlers: Paddler[] = [
    { id: '1', name: 'Alice', weight: 70, skills: ['left'] },
    { id: '2', name: 'Bob', weight: 75, skills: ['right'] },
  ];

  it('returns all paddlers for events regardless of active team filters', () => {
    const filtered = filterAndSortPaddlers(paddlers, 'Ali', ['left'], 'name', 'asc');
    const eventPaddlers = sortPaddlersForEvents(paddlers, 'name', 'asc');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');

    expect(eventPaddlers).toHaveLength(2);
    expect(eventPaddlers.map((p) => p.id)).toEqual(['1', '2']);
  });
});
