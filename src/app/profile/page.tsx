"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function ProfileView() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchProfile = async () => {
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          toast({
            title: "Error fetching profile",
            description: "Could not fetch lawyer profile.",
            variant: "destructive",
          });
        }
      };
      fetchProfile();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || !session.user) {
    return null; // Redirect handled by useEffect
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-lg">No profile found. Please create one.</p>
        <Link href="/profile/edit">
          <Button>Create Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">My Profile</h1>
        {profile.verified && (
          <div className="p-4 text-center text-green-700 bg-green-100 rounded-md">
            Profile Verified
          </div>
        )}
        <div className="flex flex-col items-center space-y-4">
          {profile.photoUrl && (
            <Image
              src={`/api/images/${profile.photoUrl}`}
              alt="Profile Photo"
              width={150}
              height={150}
              className="rounded-full object-cover"
            />
          )}
          <h2 className="text-xl font-semibold">{session.user.name || "N/A"}</h2>
          <p className="text-gray-600">{session.user.email}</p>
          <p className="text-gray-600">Role: {profile.role || "N/A"}</p>
          <p className="text-gray-700 text-center">{profile.bio}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col">
              <span className="font-medium">Specialties:</span>
              <span>{profile.specialties}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Experience:</span>
              <span>{profile.experience} years</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Consultation Fees:</span>
              <span>${profile.fees}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Availability:</span>
              <span>{profile.availability}</span>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button>Edit Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
