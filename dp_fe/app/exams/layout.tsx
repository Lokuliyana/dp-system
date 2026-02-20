import { InnerLayout } from "@/components/layout/dynamic";

export default function ExamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
