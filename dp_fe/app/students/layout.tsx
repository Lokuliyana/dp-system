import { InnerLayout } from "@/components/layout/dynamic";

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
