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
import { CreateTeacherPayload } from "@/services/masterdata/teachers.service";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";

const teacherSchema = z.object({
  firstNameSi: z.string().optional(),
  lastNameSi: z.string().optional(),
  firstNameEn: z.string().min(1, "First Name (English) is required"),
  lastNameEn: z.string().min(1, "Last Name (English) is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  dob: z.string().optional(), // ISO string
  dateJoined: z.string().min(1, "Date Joined is required"), // ISO string
  roleIds: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  qualificationsInput: z.string().optional(),
  nic: z.string().optional(),
});

interface TeacherFormProps {
  defaultValues?: Partial<CreateTeacherPayload>;
  onSubmit: (data: CreateTeacherPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function TeacherForm({ defaultValues, onSubmit, isLoading, onCancel }: TeacherFormProps) {
  const { data: roles = [] } = useStaffRoles();

  const form = useForm<CreateTeacherPayload>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstNameSi: "",
      lastNameSi: "",
      firstNameEn: "",
      lastNameEn: "",
      email: "",
      phone: "",
      roleIds: [],
      qualifications: [],
      qualificationsInput: defaultValues?.qualifications?.join(", ") ?? "",
      status: "active",
      dateJoined: new Date().toISOString(),
      ...defaultValues,
    },
  });

  const handleSubmit = (values: CreateTeacherPayload) => {
    if ((values as any).qualificationsInput) {
      const parts = (values as any).qualificationsInput
        .split(",")
        .map((p: string) => p.trim())
        .filter(Boolean);
      values.qualifications = parts;
    }
    delete (values as any).qualificationsInput;
    delete (values as any).nic;
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstNameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="First Name (Sinhala)" {...field} />
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
                  <Input placeholder="Last Name (Sinhala)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="First Name (English)" {...field} />
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
                  <Input placeholder="Last Name (English)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateJoined"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Joined</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  />
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIC / National ID</FormLabel>
                <FormControl>
                  <Input placeholder="National ID (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="qualificationsInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualifications</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Comma separated (e.g., B.Ed, M.Ed)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="roleIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Assigned Roles</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {roles.map((role) => (
                  <FormField
                    key={role.id}
                    control={form.control}
                    name="roleIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={role.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(role.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), role.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== role.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {role.nameEn}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Staff Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
