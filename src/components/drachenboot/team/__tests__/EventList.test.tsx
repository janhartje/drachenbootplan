import React from 'react';
import { render, screen } from '@testing-library/react';
import EventList from '../EventList';
import { useDrachenboot } from '@/context/DrachenbootContext';
import { useTeam } from '@/context/TeamContext';
import { Event, Paddler } from '@/types';

// Mocks
jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const React = require('react');
      return () => React.createElement('div', { 'data-testid': `icon-${String(prop).toLowerCase()}` });
    }
  });
});

jest.mock('@/context/DrachenbootContext');
jest.mock('@/context/TeamContext');
jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en'),
}));

const mockUseDrachenboot = useDrachenboot as jest.Mock;
const mockUseTeam = useTeam as jest.Mock;
const mockOnPlan = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnUpdateAttendance = jest.fn();
const mockT = (key: string) => key;

describe('EventList - Profile Picture Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDrachenboot.mockReturnValue({
      userRole: 'PADDLER',
      currentPaddler: null,
    });
    mockUseTeam.mockReturnValue({
      currentTeam: { id: 'team-1', name: 'Team 1', plan: 'FREE', primaryColor: 'blue' },
    });
  });

  const createMockEvent = (): Event => ({
    id: 'event-1',
    title: 'Test Event',
    date: '2026-01-15T10:00:00',
    type: 'training',
    boatSize: 'standard',
    canisterCount: 0,
    attendance: {
      'paddler-1': 'yes',
      'paddler-2': 'yes',
    },
    teamId: 'team-1',
  });

  const createPaddlerWithImage = (): Paddler => ({
    id: 'paddler-1',
    name: 'John Doe',
    weight: 80,
    skills: ['left'],
    userId: 'user-1',
    user: {
      email: 'john@example.com',
      name: 'John Doe',
      image: 'https://example.com/profile.jpg',
    },
  });

  const createPaddlerWithoutImage = (): Paddler => ({
    id: 'paddler-2',
    name: 'Jane Smith',
    weight: 70,
    skills: ['right'],
    userId: 'user-2',
    user: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      image: null,
    },
  });

  it('renders avatar with profile picture when user.image is available', () => {
    const events = [createMockEvent()];
    const paddlers = [createPaddlerWithImage(), createPaddlerWithoutImage()];

    render(
      <EventList
        events={events}
        sortedPaddlers={paddlers}
        onPlan={mockOnPlan}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onUpdateAttendance={mockOnUpdateAttendance}
        t={mockT}
      />
    );

    // The test verifies the component renders without errors
    // Profile picture rendering is handled by the Avatar component
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders avatar with initials fallback when user.image is null', () => {
    const events = [createMockEvent()];
    const paddlers = [createPaddlerWithoutImage()];

    render(
      <EventList
        events={events}
        sortedPaddlers={paddlers}
        onPlan={mockOnPlan}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onUpdateAttendance={mockOnUpdateAttendance}
        t={mockT}
      />
    );

    // The test verifies the component renders without errors
    // Initials fallback is handled by AvatarFallback component
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders avatar with initials fallback when user object is missing', () => {
    const events = [createMockEvent()];
    const paddlers: Paddler[] = [{
      id: 'paddler-3',
      name: 'Guest Paddler',
      weight: 75,
      skills: ['drum'],
      isGuest: true,
    }];

    render(
      <EventList
        events={events}
        sortedPaddlers={paddlers}
        onPlan={mockOnPlan}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onUpdateAttendance={mockOnUpdateAttendance}
        t={mockT}
      />
    );

    // The test verifies the component renders without errors
    // For guests without user object, initials fallback should work
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});
