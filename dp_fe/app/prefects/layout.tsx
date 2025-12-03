import { InnerLayout } from "@/components/layout/dynamic";

export default function PrefectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
