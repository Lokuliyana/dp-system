// app/login/page.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { authService } from "@/services/masterdata/auth.service";
import { cn } from "@/lib/utils";

type FormState = {
  identifier: string;
  password?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [view, setView] = React.useState<'login' | 'reset-password'>('login');
  
  // Login Form State
  const [form, setForm] = React.useState<FormState>({
    identifier: "",
    password: "",
  });

  // Reset Password State
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isResetting, setIsResetting] = React.useState(false);

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

        if (data?.accessToken)
          localStorage.setItem("accessToken", data.accessToken);
        if (data?.refreshToken)
          localStorage.setItem("refreshToken", data.refreshToken);
        if (data?.user) localStorage.setItem("me", JSON.stringify(data.user));
        
        if (data?.user?.isFirstTimeLogin) {
          setView('reset-password');
          setNewPassword("");
          setConfirmPassword("");
        } else {
          router.replace(redirectTo);
        }
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);

    if (newPassword.length < 6) {
      setErrMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrMsg("Passwords do not match.");
      return;
    }

    setIsResetting(true);
    try {
      await authService.resetPassword(newPassword);
      
      // Update local storage user if exists
      const meStr = localStorage.getItem("me");
      if (meStr) {
        const me = JSON.parse(meStr);
        me.isFirstTimeLogin = false;
        localStorage.setItem("me", JSON.stringify(me));
      }
      
      router.replace(redirectTo);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password.";
      setErrMsg(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">

      <Card className="w-full max-w-lg border-slate-200 bg-white shadow-xl relative z-10 overflow-hidden">
        
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="mx-auto w-24 h-24 flex items-center justify-center mb-4">
            <Image src="/logo.png" alt="Sri Ananda Logo" width={96} height={96} className="object-contain" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
              {view === 'login' ? "Sri Ananda" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-slate-500 text-base">
              {view === 'login' 
                ? "Please sign in to your account" 
                : "This is your first login. Please set a new password."}
            </CardDescription>
          </div>
        </CardHeader>

        {view === 'login' ? (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-slate-700 font-medium ml-1">Account Identifier</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="Email or phone number"
                      value={form.identifier}
                      onChange={(e) => onChange("identifier", e.target.value)}
                      disabled={loginMut.isPending}
                      required
                      className="h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary/50 transition-all pl-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" title="password" className="text-slate-700 font-medium">Password</Label>
                    <Button variant="link" className="p-0 h-auto text-xs text-slate-400 hover:text-primary transition-colors" type="button">
                      Forgot Access?
                    </Button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => onChange("password", e.target.value)}
                      disabled={loginMut.isPending}
                      className="h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary/50 transition-all pl-11 pr-12 rounded-xl"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPw((v) => !v)}
                      disabled={loginMut.isPending}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {errMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-red-500">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium">{errMsg}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-8 pt-4 pb-12">
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold transition-all rounded-xl relative overflow-hidden group"
                disabled={loginMut.isPending}
              >
                <span className={cn(
                  "flex items-center justify-center gap-2 transition-transform duration-300",
                  loginMut.isPending ? "translate-x-0" : "group-hover:translate-x-1"
                )}>
                  {loginMut.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </Button>
              
              <p className="text-center text-slate-400 text-sm">
                Sri Ananda Educational Complex &copy; {new Date().getFullYear()}
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" title="password" className="text-slate-700 font-medium ml-1">New Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="newPassword"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isResetting}
                      required
                      className="h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary/50 transition-all pl-11 pr-12 rounded-xl"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPw((v) => !v)}
                      disabled={isResetting}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" title="password" className="text-slate-700 font-medium ml-1">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isResetting}
                      required
                      className="h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary/50 transition-all pl-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {errMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-red-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium">{errMsg}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-8 pt-4 pb-12">
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold transition-all rounded-xl relative overflow-hidden group"
                disabled={isResetting}
              >
                <span className={cn(
                  "flex items-center justify-center gap-2 transition-transform duration-300",
                  isResetting ? "translate-x-0" : "group-hover:translate-x-1"
                )}>
                  {isResetting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Set Password</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </span>
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
       <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
         <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
