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
  rating: z.coerce.number().min(1).max(5, { message: "Rating must be between 1 and 5." }),
  review: z.string().min(10, { message: "Review must be at least 10 characters." }),
});

export default function FeedbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchAppointments = async () => {
        const response = await fetch(`/api/appointments/completed?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data || []);
        } else {
          toast({
            title: "Error fetching appointments",
            description: "Could not fetch completed appointments.",
            variant: "destructive",
          });
        }
      };
      fetchAppointments();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 5,
      review: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (appointments.length === 0) {
      toast({
        title: "Error",
        description: "No completed appointments to review.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const appointment = appointments[0]; // Assuming the first completed appointment for simplicity

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lawyerId: appointment.lawyerId,
        citizenId: session?.user?.id,
        appointmentId: appointment._id,
        rating: values.rating,
        reviewText: values.review,
      }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Feedback submitted successfully.",
      });
      router.push("/appointments");
    } else {
      const errorData = await response.json();
      toast({
        title: "Error submitting feedback",
        description: errorData.message || "Could not submit feedback.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || !session.user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Submit Feedback</h1>
        {appointments.length === 0 ? (
          <p className="text-center text-gray-500">You have no completed appointments to review.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your review here..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
