"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AppointmentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchAppointments = async () => {
        const response = await fetch(`/api/appointments?userId=${session.user.id}&role=${session.user.role}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data || []);
        } else {
          toast({
            title: "Error fetching appointments",
            description: "Could not fetch appointments.",
            variant: "destructive",
          });
          setAppointments([]);
        }
        setLoading(false);
      };
      fetchAppointments();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (loading || status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || !session.user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">My Appointments</h1>
      <div className="mb-4 text-right">
        {session.user.role === "citizen" && (
          <Link href="/search">
            <Button>Book New Appointment</Button>
          </Link>
        )}
      </div>

      {appointments.length === 0 && (
        <div className="text-center text-gray-500">No appointments found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              {session.user.role === "lawyer" ? 
                `Appointment with ${appointment.citizen?.fullName || "Citizen"}` :
                `Appointment with ${appointment.lawyer?.fullName || "Lawyer"}`
              }
            </h2>
            <p className="text-gray-600">Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p className="text-gray-600">Time: {appointment.appointmentTime}</p>
            <p className="text-gray-600">Duration: {appointment.duration} minutes</p>
            <p className="text-gray-700">Status: {appointment.status}</p>
            <p className="text-gray-700">Notes: {appointment.notes || "N/A"}</p>
            {/* Add buttons for reschedule/cancel/accept/reject based on role and status */}
          </div>
        ))}
      </div>
    </div>
  );
}
