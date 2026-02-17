import { InnerLayout } from "@/components/layout/dynamic";

export default function ChampionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}

