"use client";

import { updateProfile } from "@/app/(user)/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Loader2 } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const profileSchema = z.object({
  firstName: z.string().min(2, "Name must be at least two characters."),
  secondName: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(5, "Street too short"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().default("Nigeria"),
  }),
});

export type FormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    fullName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string | null;
    } | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema) as Resolver<FormValues>,
    defaultValues: {
      firstName: initialData.fullName.split(" ")[0] || "",
      secondName: initialData.fullName.split(" ")[1] || "",
      phone: initialData.phone || "",
      address: {
        street: initialData.address?.street || "",
        city: initialData.address?.city || "",
        state: initialData.address?.state || "",
        country: initialData.address?.country || "Nigeria",
      },
    },
  });

  const { isSubmitting, errors } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await updateProfile(values);

      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
  };

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      {/* 1. Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Your details used for order communication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={initialData.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
              />
              {errors.firstName && (
                <p className="text-destructive text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondName">Last Name</Label>
              <Input
                id="secondName"
                placeholder="Doe"
                {...form.register("secondName")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+234..."
              {...form.register("phone")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
          <CardDescription>
            This will be used as your default shipping address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="123 Lagos Way"
              {...form.register("address.street")}
            />
            {errors.address?.street && (
              <p className="text-destructive text-xs">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Ikeja"
                {...form.register("address.city")}
              />
              {errors.address?.city && (
                <p className="text-destructive text-xs">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select
                onValueChange={(value) => form.setValue("address.state", value)}
                defaultValue={form.getValues("address.state")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oyo">Oyo</SelectItem>
                  <SelectItem value="Ogun">Ogun</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  {/* Add more states as needed */}
                </SelectContent>
              </Select>
              {errors.address?.state && (
                <p className="text-destructive text-xs">
                  {errors.address.state.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
