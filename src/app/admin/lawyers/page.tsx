"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export default function AdminLawyersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [lawyers, setLawyers] = useState<any[]>([]);
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

      const fetchLawyers = async () => {
        const response = await fetch("/api/admin/lawyers");
        if (response.ok) {
          const data = await response.json();
          setLawyers(data || []);
        } else {
          toast({
            title: "Error fetching lawyers",
            description: "Could not fetch lawyer data.",
            variant: "destructive",
          });
          setLawyers([]);
        }
        setLoading(false);
      };
      fetchLawyers();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleVerificationChange = async (lawyerId: string, currentStatus: boolean) => {
    const response = await fetch(`/api/admin/lawyers/${lawyerId}/verify`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ verified: !currentStatus }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Lawyer verification status updated.",
      });
      setLawyers(lawyers.map(lawyer => 
        lawyer._id === lawyerId ? { ...lawyer, verified: !currentStatus } : lawyer
      ));
    } else {
      const errorData = await response.json();
      toast({
        title: "Error updating verification status",
        description: errorData.message || "Could not update verification status.",
        variant: "destructive",
      });
    }
  };

  if (loading || status === "loading" || !session || session.user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Lawyers</h1>

      {lawyers.length === 0 && (
        <div className="text-center text-gray-500">No lawyers found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer) => (
          <div key={lawyer._id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold">{lawyer.fullName || "N/A"}</h2>
            <p className="text-gray-600">Email: {lawyer.email || "N/A"}</p>
            <p className="text-gray-600">Specialties: {lawyer.specialties}</p>
            <p className="text-gray-600">Verified: {lawyer.verified ? "Yes" : "No"}</p>
            <Button 
              onClick={() => handleVerificationChange(lawyer._id, lawyer.verified)}
              className="mt-4 w-full"
              variant={lawyer.verified ? "destructive" : "default"}
            >
              {lawyer.verified ? "Unverify" : "Verify"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
