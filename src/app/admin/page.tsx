"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You do not have administrative privileges.",
          variant: "destructive",
        });
        router.push("/");
      }
      setLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (loading || status === "loading" || !session || session.user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/lawyers">
          <Button className="w-full h-24 text-xl">Manage Lawyers</Button>
        </Link>
        <Link href="/admin/users">
          <Button className="w-full h-24 text-xl">Manage Users</Button>
        </Link>
        <Link href="/admin/content">
          <Button className="w-full h-24 text-xl">Content Moderation</Button>
        </Link>
        {/* Add more admin links as needed */}
      </div>
    </div>
  );
}
