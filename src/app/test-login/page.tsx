import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TestLoginView from "@/components/auth/TestLoginView"

export default async function TestLoginPage() {
  const session = await auth()
  
  const isDev = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  const isLocalProduction = process.env.ENABLE_TEST_USER === 'true';

  // Only allow access if in dev/test or explicitly enabled
  if (!isDev && !isTest && !isLocalProduction) {
    redirect("/")
  }
  
  if (session?.user) {
    redirect("/app")
  }

  return <TestLoginView />
}
