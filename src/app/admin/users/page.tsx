"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
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
        return;
      }

      const fetchUsers = async () => {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data || []);
        } else {
          toast({
            title: "Error fetching users",
            description: "Could not fetch user data.",
            variant: "destructive",
          });
          setUsers([]);
        }
        setLoading(false);
      };
      fetchUsers();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSuspendUser = async (userId: string, currentStatus: boolean) => {
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ suspended: !currentStatus }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: `User ${userId} has been ${!currentStatus ? "suspended" : "unsuspended"}.`,
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, suspended: !currentStatus } : user
      ));
    } else {
      const errorData = await response.json();
      toast({
        title: "Error updating user status",
        description: errorData.message || "Could not update user status.",
        variant: "destructive",
      });
    }
  };

  if (loading || status === "loading" || !session || session.user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Users</h1>

      {users.length === 0 && (
        <div className="text-center text-gray-500">No users found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold">{user.fullName || "N/A"}</h2>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Role: {user.role || "N/A"}</p>
            <p className="text-gray-600">Status: {user.suspended ? "Suspended" : "Active"}</p>
            <Button 
              onClick={() => handleSuspendUser(user._id, user.suspended)}
              className="mt-4 w-full"
              variant={user.suspended ? "default" : "destructive"}
            >
              {user.suspended ? "Unsuspend" : "Suspend"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
