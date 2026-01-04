"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/hooks/use-users-mock";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  dataObject?: User;
  onSuccess?: () => void;
}

export function UserForm({ dataObject, onSuccess }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: dataObject?.name || "",
      email: dataObject?.email || "",
      role: dataObject?.role?.name || "",
    },
  });

  const onSubmit = (data: UserFormValues) => {
    console.log("Form submitted:", data);
    onSuccess?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" {...form.register("role")} />
        {form.formState.errors.role && (
          <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        {dataObject ? "Update User" : "Create User"}
      </Button>
    </form>
  );
}
