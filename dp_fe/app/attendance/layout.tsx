import { InnerLayout } from "@/components/layout/dynamic";

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
