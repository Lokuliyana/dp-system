// app/login/page.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { Label } from "@/components/ui";

type FormState = {
  identifier: string;
  password?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [form, setForm] = React.useState<FormState>({
    identifier: "admin@gmail.com",
    password: "",
  });

  const [showPw, setShowPw] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const loginMut = useLogin();

  function onChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    loginMut.mutate({
      identifier: form.identifier.trim(),
      password: form.password || "",
    }, {
      onSuccess: (data) => {
        setErrMsg(null);

        // Store tokens for axios interceptor / session-store usage
        if (data?.accessToken)
          localStorage.setItem("accessToken", data.accessToken);
        if (data?.refreshToken)
          localStorage.setItem("refreshToken", data.refreshToken);
        if (data?.user) localStorage.setItem("me", JSON.stringify(data.user));

        router.replace(redirectTo);
      },
      onError: (e: any) => {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Login failed. Check credentials.";
        setErrMsg(msg);
      },
    });
  }

  return (
    <div className="min-h-[calc(100vh-0px)] w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500 text-base">
            Sign in to your administrative dashboard
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">
            {/* Demo Credentials Alert */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Demo Credentials
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between group p-2 hover:bg-white rounded transition-colors cursor-pointer" onClick={() => {
                  navigator.clipboard.writeText("admin@gmail.com");
                  setForm(p => ({ ...p, identifier: "admin@gmail.com" }));
                }}>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium text-slate-900">Login:</span>
                    <span className="font-mono">admin@gmail.com</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
                <div className="flex items-center justify-between group p-2 hover:bg-white rounded transition-colors cursor-pointer" onClick={() => {
                   navigator.clipboard.writeText("admin123");
                   setForm(p => ({ ...p, password: "admin123" }));
                }}>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium text-slate-900">Pass:</span>
                    <span className="font-mono">admin123</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="Email or phone number"
                  value={form.identifier}
                  onChange={(e) => onChange("identifier", e.target.value)}
                  disabled={loginMut.isPending}
                  required
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>


              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary" type="button">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => onChange("password", e.target.value)}
                    disabled={loginMut.isPending}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-9 text-xs text-slate-500 hover:text-slate-900"
                    onClick={() => setShowPw((v) => !v)}
                    disabled={loginMut.isPending}
                  >
                    {showPw ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
            </div>

            {errMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {errMsg}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={loginMut.isPending}
            >
              {loginMut.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
