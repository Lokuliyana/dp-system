"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import type { CreateParentPayload } from "@/services/parents.service";

const parentSchema = z.object({
  firstNameSi: z.string().optional(),
  lastNameSi: z.string().optional(),
  firstNameEn: z.string().min(1, "First name (English) is required"),
  lastNameEn: z.string().min(1, "Last name (English) is required"),
  occupationSi: z.string().optional(),
  occupationEn: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phoneNum: z.string().optional(),
  addressSi: z.string().optional(),
  addressEn: z.string().optional(),
});

type ParentFormProps = {
  defaultValues?: Partial<CreateParentPayload>;
  onSubmit: (values: CreateParentPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ParentForm({ defaultValues, onSubmit, onCancel, isLoading }: ParentFormProps) {
  const form = useForm<CreateParentPayload>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      firstNameSi: "",
      lastNameSi: "",
      firstNameEn: "",
      lastNameEn: "",
      occupationSi: "",
      occupationEn: "",
      email: "",
      phoneNum: "",
      addressSi: "",
      addressEn: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="First name (English)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Last name (English)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstNameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="Sinhala first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastNameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="Sinhala last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="occupationEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Occupation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="occupationSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="රැකියාව" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="addressEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="ලිපිනය" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Parent"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
