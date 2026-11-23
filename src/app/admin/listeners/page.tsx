import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/requestAuth";
import { AdminListenersDashboard } from "@/components/AdminListenersDashboard";

async function AdminListenersContent() {
  const auth = await getAuthenticatedUser();

  if (!auth.user || !auth.isAdmin) {
    redirect("/");
  }

  return <AdminListenersDashboard />;
}

export default function AdminListenersPage() {
  return (
    <Suspense fallback={<div>Loading administrator dashboard...</div>}>
      <AdminListenersContent />
    </Suspense>
  );
}

export const instant = false;
