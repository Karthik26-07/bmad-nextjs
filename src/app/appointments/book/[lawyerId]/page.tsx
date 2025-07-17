"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  appointment_date: z.string().min(1, { message: "Date is required." }),
  appointment_time: z.string().min(1, { message: "Time is required." }),
  duration: z.coerce.number().min(1, { message: "Duration is required." }),
  notes: z.string().optional(),
});

export default function BookAppointmentPage({ params }: { params: { lawyerId: string } }) {
  const { lawyerId } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lawyer, setLawyer] = useState<any>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchLawyer = async () => {
        const response = await fetch(`/api/lawyers/${lawyerId}`);
        if (response.ok) {
          const data = await response.json();
          setLawyer(data);
        } else {
          toast({
            title: "Error fetching lawyer details",
            description: "Could not fetch lawyer details.",
            variant: "destructive",
          });
          router.push("/search");
        }
      };
      fetchLawyer();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [lawyerId, router, session, status]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointment_date: "",
      appointment_time: "",
      duration: 60,
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to book an appointment.",
        variant: "destructive",
      });
      router.push("/auth/login");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/appointments/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lawyerId,
        citizenId: session.user.id,
        appointmentDate: values.appointment_date,
        appointmentTime: values.appointment_time,
        duration: values.duration,
        notes: values.notes,
      }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Appointment booked successfully. Waiting for lawyer confirmation.",
      });
      router.push("/appointments");
    } else {
      const errorData = await response.json();
      toast({
        title: "Error booking appointment",
        description: errorData.message || "Could not book appointment.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  if (status === "loading" || !lawyer) {
    return <div className="flex items-center justify-center min-h-screen">Loading lawyer details...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Book Appointment with {lawyer.fullName}</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="appointment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointment_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
