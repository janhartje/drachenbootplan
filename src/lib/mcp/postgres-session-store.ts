import { McpSessionStore, SessionData } from './session-store';
import prisma from '@/lib/prisma';
import { createHash } from 'crypto';

// In-memory cache for session lookups
interface CacheEntry {
    data: SessionData;
    expiresAt: number;
}

const sessionCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10000; // 10 seconds

// Cleanup interval for cache (prevent memory leaks)
let cacheCleanupInterval: NodeJS.Timeout | null = null;

function ensureCacheCleanup() {
    if (cacheCleanupInterval) return;
    cacheCleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of sessionCache.entries()) {
            if (now > entry.expiresAt) {
                sessionCache.delete(key);
            }
        }
        if (sessionCache.size === 0) {
            clearInterval(cacheCleanupInterval!);
            cacheCleanupInterval = null;
        }
    }, 30000);
}

export class PostgresSessionStore implements McpSessionStore {
    private maxRetries = 2;
    private retryDelayMs = 100;

    async createSession(id: string, apiKey: string): Promise<void> {
        const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

        await this.withRetry(async () => {
            await prisma.mcpSession.create({
                data: {
                    id,
                    apiKeyHash,
                },
            });
        });

        // Pre-populate cache
        const sessionData: SessionData = {
            id,
            apiKey: apiKeyHash,
            createdAt: Date.now(),
        };
        sessionCache.set(id, { data: sessionData, expiresAt: Date.now() + CACHE_TTL_MS });
        ensureCacheCleanup();
    }

    async getSession(id: string): Promise<SessionData | null> {
        // Check cache first
        const cached = sessionCache.get(id);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data;
        }

        // Cache miss or expired - query DB with retry
        const session = await this.withRetry(async () => {
            return prisma.mcpSession.findUnique({
                where: { id },
            });
        });

        if (!session) {
            sessionCache.delete(id); // Ensure cache is clean
            return null;
        }

        const sessionData: SessionData = {
            id: session.id,
            apiKey: session.apiKeyHash,
            createdAt: session.createdAt.getTime(),
        };

        // Update cache
        sessionCache.set(id, { data: sessionData, expiresAt: Date.now() + CACHE_TTL_MS });
        ensureCacheCleanup();

        return sessionData;
    }

    async removeSession(id: string): Promise<void> {
        sessionCache.delete(id); // Invalidate cache immediately

        try {
            await this.withRetry(async () => {
                await prisma.mcpSession.delete({
                    where: { id },
                });
            });
        } catch {
            // Ignore if not found to ensure idempotency
        }
    }

    /**
     * Executes a database operation with retry logic for transient failures.
     */
    private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Check if it's a transient error worth retrying
                const isTransient = this.isTransientError(lastError);

                if (!isTransient || attempt === this.maxRetries) {
                    console.error(`[PostgresSessionStore] Operation failed after ${attempt + 1} attempts:`, lastError.message);
                    throw lastError;
                }

                // Wait before retrying
                await this.delay(this.retryDelayMs * (attempt + 1));
            }
        }

        throw lastError!;
    }

    private isTransientError(error: Error): boolean {
        const transientPatterns = [
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'connection',
            'timeout',
            'temporarily unavailable',
        ];
        const message = error.message.toLowerCase();
        return transientPatterns.some(pattern => message.includes(pattern.toLowerCase()));
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
