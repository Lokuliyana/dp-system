"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  return (
    <React.Suspense fallback={
       <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
         <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       </div>
    }>
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
        <LoginForm 
          onSuccess={() => router.replace(redirectTo)}
        />
      </div>
    </React.Suspense>
  );
}
