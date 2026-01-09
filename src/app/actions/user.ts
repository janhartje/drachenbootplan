"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function updateProfile(data: { name: string; weight: number; skills?: string[] }, teamId?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      weight: data.weight,
    },
  })

  // Update ALL paddler records for this user (Name & Weight only)
  await prisma.paddler.updateMany({
    where: { userId: session.user.id },
    data: {
      name: data.name,
      weight: data.weight,
      // Skills are NOT synchronized globally
    },
  })

  // If provided, update skills for the specific team
  if (teamId && data.skills) {
    // Find the paddler for this user and team
    const currentPaddler = await prisma.paddler.findFirst({
      where: {
        userId: session.user.id,
        teamId: teamId
      }
    })

    if (currentPaddler) {
      // Preserve special roles that users cannot edit themselves
      // These roles are usually assigned by captains and aren't visible in the user profile form
      const SPECIAL_ROLES = ['stroke', 'steer_preferred'];
      const existingSpecialRoles = (currentPaddler.skills || []).filter(s => SPECIAL_ROLES.includes(s));
      
      // Filter out special roles from the incoming data just in case (though UI shouldn't send them)
      // Then re-add the existing special roles
      const newSkills = [
        ...(data.skills || []).filter(s => !SPECIAL_ROLES.includes(s)), 
        ...existingSpecialRoles
      ];

      // Remove duplicates
      const uniqueSkills = Array.from(new Set(newSkills));

      await prisma.paddler.update({
        where: { id: currentPaddler.id },
        data: {
          skills: uniqueSkills
        }
      })
    }
  }
}

/**
 * Upload a custom profile picture
 * @param base64Image - Base64 encoded image data (with data:image/xxx;base64, prefix)
 * @returns Success status
 */
export async function uploadProfileImage(base64Image: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Validate base64 image format
  if (!base64Image.startsWith('data:image/')) {
    throw new Error("Invalid image format")
  }

  // Check file size (limit to 2MB base64 which is ~1.5MB actual)
  const sizeInBytes = Math.ceil((base64Image.length * 3) / 4)
  const maxSizeInBytes = 2 * 1024 * 1024 // 2MB
  
  if (sizeInBytes > maxSizeInBytes) {
    throw new Error("Image size must be less than 2MB")
  }

  // Validate image type (only allow common web formats)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const mimeType = base64Image.split(';')[0].split(':')[1]
  
  if (!allowedTypes.includes(mimeType)) {
    throw new Error("Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed")
  }

  // Update user's custom image
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      customImage: base64Image,
    },
  })

  return { success: true }
}

/**
 * Delete custom profile picture
 * @returns Success status
 */
export async function deleteProfileImage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Remove custom image
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      customImage: null,
    },
  })

  return { success: true }
}
