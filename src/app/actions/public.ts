"use server"

import prisma from "@/lib/prisma"

export interface PublicTeam {
  id: string;
  name: string;
  icon?: string;
  website?: string;
}

/**
 * Fetch teams that have opted-in to be displayed on the public landing page.
 * Only returns minimal public data (id, name, logo, website).
 * Limited to 50 teams to prevent performance issues.
 * 
 * This is the single source of truth for the public teams query.
 * Used by:
 * - Landing page server component
 * - Public API endpoint
 */
export async function getPublicTeams(): Promise<PublicTeam[]> {
  try {
    const teams = await prisma.team.findMany({
      take: 50,
      where: {
        showOnWebsite: true,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        website: true,
      },
      orderBy: [
        // Sort teams with icons first (teams with icon values come before nulls in descending order)
        { icon: 'desc' },
        // Then by name alphabetically
        { name: 'asc' },
      ],
    })

    // Convert null values to undefined to match TypeScript interface
    return teams.map(team => ({
      id: team.id,
      name: team.name,
      icon: team.icon ?? undefined,
      website: team.website ?? undefined,
    }))
  } catch (error) {
    // Only log in development to avoid exposing sensitive information in production
    if (process.env.NODE_ENV !== 'production') {
      console.error("Failed to fetch public teams:", error)
    }
    return []
  }
}
