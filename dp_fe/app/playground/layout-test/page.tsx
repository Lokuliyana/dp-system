"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InnerLayout } from "@/components/layout/dynamic";
import { UserListView } from "@/components/users/user-list-view";
import { UserDetailsView } from "@/components/users/user-details-view";

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");

  return (
    <div className="w-full bg-slate-50 h-full">
      <InnerLayout>
        {userId ? (
          <UserDetailsView 
            userId={userId} 
            onBack={() => router.push("/playground/layout-test")} 
          />
        ) : (
          <UserListView />
        )}
      </InnerLayout>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
