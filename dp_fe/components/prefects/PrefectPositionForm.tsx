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
import { Textarea } from "@/components/ui/textarea";
import { CreatePrefectPositionPayload } from "@/services/masterdata/prefectPositions.service";

const positionSchema = z.object({
  nameSi: z.string().min(1, "Name (Sinhala) is required"),
  nameEn: z.string().min(1, "Name (English) is required"),
  responsibilitySi: z.string().optional(),
  responsibilityEn: z.string().optional(),
  descriptionSi: z.string().optional(),
  descriptionEn: z.string().optional(),
});

interface PrefectPositionFormProps {
  defaultValues?: Partial<CreatePrefectPositionPayload>;
  onSubmit: (data: CreatePrefectPositionPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function PrefectPositionForm({ defaultValues, onSubmit, isLoading, onCancel }: PrefectPositionFormProps) {
  const form = useForm<CreatePrefectPositionPayload>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      nameSi: "",
      nameEn: "",
      responsibilitySi: "",
      responsibilityEn: "",
      descriptionSi: "",
      descriptionEn: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="Name (Sinhala)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Name (English)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responsibilitySi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsibility (Sinhala)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Responsibility (Sinhala)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsibilityEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsibility (English)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Responsibility (English)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="descriptionSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Sinhala)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description (Sinhala)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description (English)" {...field} />
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
            {isLoading ? "Saving..." : "Save Position"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
