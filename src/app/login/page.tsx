import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginPage } from "@/components/auth/LoginPage";

export default async function LoginRoute() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }
  return <LoginPage />;
}
