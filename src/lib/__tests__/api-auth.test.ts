
// Node 25+ has native Request available via undici
// However, Jest's jsdom environment doesn't expose it, so we use mock objects

// Mock auth BEFORE import to prevent ESM errors
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../mcp-auth', () => ({
  validateApiKey: jest.fn(),
}));

import { getAuthContext } from '../api-auth';
import { auth } from '@/auth';
import { validateApiKey } from '../mcp-auth';

const mockAuth = auth as jest.Mock;
const mockValidateApiKey = validateApiKey as jest.Mock;

// Helper to create mock Request-like objects
function createMockRequest(headers: Record<string, string> = {}): Request {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
  } as unknown as Request;
}

describe('getAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Session Auth', () => {
    it('returns session context when user is logged in', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      const result = await getAuthContext();

      expect(result).toEqual({
        type: 'session',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        }
      });
    });

    it('prioritizes session over API key', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-123', name: 'User', email: 'user@example.com' }
      });

      const request = createMockRequest({ 'x-api-key': 'some-api-key' });

      const result = await getAuthContext(request);

      expect(result.type).toBe('session');
      expect(mockValidateApiKey).not.toHaveBeenCalled();
    });
  });

  describe('API Key Auth', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(null);
    });

    it('returns apiKey context with x-api-key header', async () => {
      mockValidateApiKey.mockResolvedValue({ teamId: 'team-456' });

      const request = createMockRequest({ 'x-api-key': 'dbm_live_abc123' });

      const result = await getAuthContext(request);

      expect(result).toEqual({
        type: 'apiKey',
        teamId: 'team-456'
      });
      expect(mockValidateApiKey).toHaveBeenCalledWith('dbm_live_abc123');
    });

    it('returns apiKey context with Bearer token', async () => {
      mockValidateApiKey.mockResolvedValue({ teamId: 'team-789' });

      const request = createMockRequest({ 'authorization': 'Bearer dbm_live_xyz789' });

      const result = await getAuthContext(request);

      expect(result).toEqual({
        type: 'apiKey',
        teamId: 'team-789'
      });
      expect(mockValidateApiKey).toHaveBeenCalledWith('dbm_live_xyz789');
    });

    it('returns none for invalid API key', async () => {
      mockValidateApiKey.mockResolvedValue(null);

      const request = createMockRequest({ 'x-api-key': 'invalid-key' });

      const result = await getAuthContext(request);

      expect(result).toEqual({ type: 'none' });
    });
  });

  describe('No Auth', () => {
    it('returns none when no session and no request', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getAuthContext();

      expect(result).toEqual({ type: 'none' });
    });

    it('returns none when no session and no API key header', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest({}); // Empty headers

      const result = await getAuthContext(request);

      expect(result).toEqual({ type: 'none' });
    });
  });
});
