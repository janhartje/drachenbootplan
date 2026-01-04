
import { generateApiKey, validateApiKey, checkMcpAccess } from '../mcp-auth';
import prisma from '../prisma';

// Mock Prisma
jest.mock('../prisma', () => ({
  apiKey: {
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  },
  team: {
    findUnique: jest.fn(),
  },
}));

describe('mcp-auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateApiKey', () => {
    it('should generate a key with correct format and hash', () => {
      const result = generateApiKey();
      
      expect(result.key).toMatch(/^dbm_live_[a-f0-9]+$/);
      expect(result.displayKey).toMatch(/^dbm_live_\.\.\.[a-f0-9]{4}$/);
      expect(result.hash).toBeDefined();
      expect(result.hash.length).toBeGreaterThan(0);
    });

    it('should generate unique keys', () => {
      const result1 = generateApiKey();
      const result2 = generateApiKey();
      
      expect(result1.key).not.toBe(result2.key);
      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe('validateApiKey', () => {
    it('should return team info for valid key', async () => {
      const key = 'dbm_live_testkey123';
      const mockTeam = {
        id: 'team-1',
        name: 'Test Team',
        plan: 'PRO',
      };

      (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
        id: 'key-1',
        hashedKey: expect.any(String), // We don't check exact hash here as logic is internal
        teamId: 'team-1',
        team: mockTeam,
      });

      const result = await validateApiKey(key);

      expect(result).toEqual({
        teamId: 'team-1',
        teamName: 'Test Team',
        teamPlan: 'PRO',
      });
      
      // Should verify it calls findUnique with hashed key
      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { hashedKey: expect.any(String) }
      }));

      // Should update lastUsed
      expect(prisma.apiKey.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'key-1' },
      }));
    });

    it('should return null for invalid key', async () => {
      (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await validateApiKey('invalid-key');
      
      expect(result).toBeNull();
      expect(prisma.apiKey.update).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      (prisma.apiKey.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await validateApiKey('key');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('checkMcpAccess', () => {
    it('should return true for PRO team', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue({ plan: 'PRO' });
      
      const result = await checkMcpAccess('team-1');
      expect(result).toBe(true);
    });

    it('should return false for FREE team', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue({ plan: 'FREE' });
      
      const result = await checkMcpAccess('team-1');
      expect(result).toBe(false);
    });

    it('should return false if team not found', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);
      
      const result = await checkMcpAccess('team-1');
      expect(result).toBe(false);
    });
  });
});
