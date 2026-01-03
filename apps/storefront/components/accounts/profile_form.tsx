"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { updateProfile } from "@/app/(user)/account/profile/actions";
import { useFormState, useFormStatus } from "react-dom"; // Next.js 14/15+ hook
import { useEffect } from "react";
// import { toast } from "sonner"; // Assuming you use Sonner or similar

import * as z from "zod";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema) as Resolver<FormValues>,
    defaultValues: {
      firstName: initialData.fullName.split(" ")[0],
      secondName: initialData.fullName.split(" ")[1],
      phone: initialData.phone,
      address: {
        street: initialData.address?.street,
        city: initialData.address?.city,
        state: initialData.address?.state,
        country: initialData.address?.country || "Nigeria",
      },
    },
  });

  const state = form.formState;

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    const { message } = await updateProfile(values);
    console.log(message);
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
              className="bg-muted"
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              defaultValue={form.getValues("firstName")}
              {...form.register("firstName")}
            />
            {state.errors?.firstName && (
              <p className="text-red-500 text-xs">Name is too short</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="secondName">Last Name</Label>
            <Input
              id="secondName"
              defaultValue={form.getValues("secondName")}
              {...form.register("secondName")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              defaultValue={form.getValues("phone")}
              placeholder="+234..."
              {...form.register("phone")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Delivery Address (JSONB Fields) */}
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
              defaultValue={initialData.address?.street || ""}
              placeholder="123 Lagos Way"
              {...form.register("address.street")}
            />
            {state.errors?.address && (
              <p className="text-red-500 text-xs">Address Error</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                defaultValue={initialData.address?.city || ""}
                placeholder="Ikeja"
                {...form.register("address.city")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select
                {...form.register("address.state")}
                onValueChange={(e) => form.setValue("address.state", e)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={form.getValues("address.state") || "State"}
                  />
                </SelectTrigger>
                <SelectContent
                  id="state"
                  defaultValue={form.getValues("address.state")}
                >
                  <SelectItem value="Oyo">Oyo</SelectItem>
                  <SelectItem value="Ogun">Ogun</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
