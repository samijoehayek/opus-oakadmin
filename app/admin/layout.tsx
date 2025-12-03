import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components";
import { AdminHeader } from "@/components";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Redirect if not authenticated or not admin
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/auth?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <div className="lg:pl-64">
        <AdminHeader user={user} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
