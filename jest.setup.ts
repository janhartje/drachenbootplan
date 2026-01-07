import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

jest.mock('next-auth/react', () => {
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { username: "admin" }
  };
  return {
    __esModule: true,
    useSession: jest.fn(() => ({ data: mockSession, status: 'authenticated' })),
    SessionProvider: jest.fn(({ children }) => children),
    signIn: jest.fn(),
    signOut: jest.fn(),
  };
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
) as jest.Mock;
