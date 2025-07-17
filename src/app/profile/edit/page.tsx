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
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  specialties: z.string().min(2, { message: "Specialties must be at least 2 characters." }),
  experience: z.coerce.number().min(0, { message: "Experience must be a positive number." }),
  fees: z.coerce.number().min(0, { message: "Fees must be a positive number." }),
  availability: z.string().min(2, { message: "Availability must be at least 2 characters." }),
  photo: z.any().optional(),
});

export default function ProfileEdit() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
      specialties: "",
      experience: 0,
      fees: 0,
      availability: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchProfile = async () => {
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setProfile(data);
            form.reset(data);
          }
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
  }, [session, status, router, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let photoUrl = profile?.photoUrl;

    if (values.photo && values.photo[0]) {
      const formData = new FormData();
      formData.append('file', values.photo[0]);
      formData.append('userId', session?.user?.id);

      const uploadResponse = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        toast({
          title: "Error uploading image",
          description: errorData.message || "Could not upload image.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      const uploadData = await uploadResponse.json();
      photoUrl = uploadData.fileId; // Assuming the API returns the GridFS file ID
    }

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: session?.user?.id, ...values, photoUrl }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      router.push("/profile");
    } else {
      const errorData = await response.json();
      toast({
        title: "Error updating profile",
        description: errorData.message || "Could not update profile.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Edit your profile</h1>
        {profile?.verified && (
          <div className="p-4 text-center text-green-700 bg-green-100 rounded-md">
            Your profile is verified.
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialties</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Family Law, Criminal Law" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consultation Fees</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mon-Fri, 9am-5pm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <Input type="file" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
