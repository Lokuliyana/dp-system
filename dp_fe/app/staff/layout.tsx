import { InnerLayout } from "@/components/layout/dynamic";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
