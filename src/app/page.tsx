import { LoginPage } from "@/components/auth/LoginPage";

export default function Home() {
  // Always render the login page by default so users see the sign-in UI on startup.
  return <LoginPage />;
}
