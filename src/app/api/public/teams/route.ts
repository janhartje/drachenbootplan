import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Limit to 50 teams to prevent DoS via memory exhaustion
    const teams = await prisma.team.findMany({
      take: 50,
      where: {
        showOnWebsite: true,
      },
      select: {
        name: true,
        icon: true,
        website: true,
      },
      orderBy: [
        // Sort teams with logos first (icon IS NOT NULL)
        { icon: 'desc' },
        // Then by name alphabetically
        { name: 'asc' },
      ],
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Failed to fetch public teams:', error);
    return NextResponse.json([], { status: 500 });
  }
}
