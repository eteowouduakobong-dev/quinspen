import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/requestAuth";
import { AdminListenersDashboard } from "@/components/AdminListenersDashboard";

export default async function AdminListenersPage() {
  const auth = await getAuthenticatedUser();

  if (!auth.user || !auth.isAdmin) {
    redirect("/");
  }

  return <AdminListenersDashboard />;
}

export const instant = false;
