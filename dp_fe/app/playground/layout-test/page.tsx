"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InnerLayout } from "@/components/layout/dynamic";
import { UserListView } from "@/components/users/user-list-view";
import { UserDetailsView } from "@/components/users/user-details-view";

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");

  return (
    <div className="h-screen w-full bg-slate-50">
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
