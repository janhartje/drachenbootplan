import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getUserProfile } from '@/app/actions/user'

export function useUserProfile() {
  const { data: session } = useSession()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user?.id) {
        setIsLoading(true)
        try {
          const profile = await getUserProfile()
          if (profile) {
            setProfileImage(profile.customImage || profile.image || null)
          }
        } catch (error) {
          console.error('Failed to load profile', error)
          // Fallback to session image
          setProfileImage(session.user.image || null)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadProfile()
  }, [session?.user?.id, session?.user?.image])

  return { profileImage, isLoading }
}
