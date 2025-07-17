"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export default function AdminContentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [feedback, setFeedback] = useState<any[]>([]);
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

      const fetchFeedback = async () => {
        const response = await fetch("/api/admin/feedback");
        if (response.ok) {
          const data = await response.json();
          setFeedback(data || []);
        } else {
          toast({
            title: "Error fetching feedback",
            description: "Could not fetch feedback data.",
            variant: "destructive",
          });
          setFeedback([]);
        }
        setLoading(false);
      };
      fetchFeedback();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleModerateFeedback = async (feedbackId: string, action: "approve" | "reject") => {
    const response = await fetch(`/api/admin/feedback/${feedbackId}/moderate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: `Feedback ${feedbackId} has been ${action}d.`,
      });
      // Optionally re-fetch feedback or update state to reflect the change
      setFeedback(feedback.filter(item => item._id !== feedbackId));
    } else {
      const errorData = await response.json();
      toast({
        title: "Error moderating feedback",
        description: errorData.message || "Could not moderate feedback.",
        variant: "destructive",
      });
    }
  };

  if (loading || status === "loading" || !session || session.user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Content Moderation</h1>

      {feedback.length === 0 && (
        <div className="text-center text-gray-500">No feedback to moderate.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold">Feedback from {item.citizen?.fullName || "N/A"}</h2>
            <p className="text-gray-600">For Lawyer: {item.lawyer?.fullName || "N/A"}</p>
            <p className="text-gray-600">Rating: {item.rating}</p>
            <p className="text-gray-700">Review: {item.reviewText}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleModerateFeedback(item._id, "approve")}>Approve</Button>
              <Button onClick={() => handleModerateFeedback(item._id, "reject")} variant="destructive">Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
