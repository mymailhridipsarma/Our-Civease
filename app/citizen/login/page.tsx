import { AuthForm } from "@/components/auth-form"

export default function CitizenLoginPage() {
  return (
    <AuthForm
      type="login"
      role="citizen"
      title="Citizen Login"
      description="Sign in to report issues and track their progress"
    />
  )
}
