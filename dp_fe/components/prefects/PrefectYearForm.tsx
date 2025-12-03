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
import { CreatePrefectYearPayload } from "@/services/masterdata/prefects.service";

const prefectYearSchema = z.object({
  year: z.number().min(2000, "Year must be valid").max(2100, "Year must be valid"),
});

interface PrefectYearFormProps {
  onSubmit: (data: CreatePrefectYearPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function PrefectYearForm({ onSubmit, isLoading, onCancel }: PrefectYearFormProps) {
  const form = useForm<CreatePrefectYearPayload>({
    resolver: zodResolver(prefectYearSchema),
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Year"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
