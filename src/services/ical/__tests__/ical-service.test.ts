import { syncTeamEvents } from '../ical-service';
import prisma from '@/lib/prisma';
import ical from 'node-ical';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock prisma
jest.mock('@/lib/prisma', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { mockDeep } = require('jest-mock-extended');
  return {
    __esModule: true,
    default: mockDeep(),
  };
});

// Mock node-ical
jest.mock('node-ical', () => ({
  async: {
    fromURL: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe('iCal Service', () => {
  const teamId = 'test-team-id';
  const icalUrl = 'https://example.com/calendar.ics';

  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  it('should fetch iCal feed and upsert events', async () => {
    // 1. Mock Team with iCal URL
    prismaMock.team.findUnique.mockResolvedValue({
      id: teamId,
      icalUrl: icalUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any); // Mocking deep partial is hard, casting to any for mock simplicity

    // 2. Mock iCal Response
    const mockEvents = {
      'event-1': {
        type: 'VEVENT',
        uid: 'uid-1',
        summary: 'Training',
        start: new Date('2024-01-01T10:00:00Z'),
        end: new Date('2024-01-01T12:00:00Z'),
      },
      'event-2': {
        type: 'VEVENT',
        uid: 'uid-2',
        summary: 'Regatta',
        start: new Date('2024-02-01T10:00:00Z'),
        end: new Date('2024-02-01T18:00:00Z'),
      },
      'random-stuff': {
        type: 'VTIMEZONE', // Should be ignored
      }
    };
    (ical.async.fromURL as jest.Mock).mockResolvedValue(mockEvents);

    // 3. Call Service
    const result = await syncTeamEvents(teamId);

    // 4. Verify
    expect(result.success).toBe(true);
    expect(result.count).toBe(2);

    expect(ical.async.fromURL).toHaveBeenCalledWith(icalUrl);

    // Verify Upserts
    expect(prismaMock.event.upsert).toHaveBeenCalledTimes(2);
    
    // Check first event
    expect(prismaMock.event.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        teamId_externalUid: {
            teamId,
            externalUid: 'uid-1'
        }
      },
      create: expect.objectContaining({
        teamId,
        title: 'Training',
        externalUid: 'uid-1',
        type: 'training' // Default
      }),
      update: expect.objectContaining({
        title: 'Training',
        // Update logic: we generally want to update time and title if they changed
      })
    }));
  });

  it('should throw error if team has no iCal URL', async () => {
    prismaMock.team.findUnique.mockResolvedValue({
        id: teamId,
        icalUrl: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    await expect(syncTeamEvents(teamId)).rejects.toThrow('No iCal URL found for team');
  });
});
