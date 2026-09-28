import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DeviceIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { id } = await searchParams;
  const deviceId = typeof id === "string" ? id.trim() : null;

  if (deviceId) {
    redirect(`/device/${encodeURIComponent(deviceId)}`);
  }

  redirect("/");
}
