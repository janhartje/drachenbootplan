import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Session TTL: Sessions older than this are considered expired and will be deleted.
// Default: 24 hours (86400000 ms)
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET() {
    try {
        const cutoffDate = new Date(Date.now() - SESSION_TTL_MS);

        // Delete sessions that are:
        // 1. Explicitly expired (expiresAt < now), OR
        // 2. Old sessions without explicit expiry (createdAt < cutoffDate)
        const result = await prisma.mcpSession.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    {
                        createdAt: { lt: cutoffDate },
                        expiresAt: null
                    },
                ],
            },
        });

        console.log(`[MCP Cleanup] Deleted ${result.count} expired sessions.`);

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            cutoffDate: cutoffDate.toISOString(),
        });

    } catch (error) {
        console.error('[MCP Cleanup] Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
