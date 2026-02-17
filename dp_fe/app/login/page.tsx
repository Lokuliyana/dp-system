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
import { BookOpen, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type FormState = {
  identifier: string;
  password?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [form, setForm] = React.useState<FormState>({
    identifier: "",
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

        if (data?.accessToken)
          localStorage.setItem("accessToken", data.accessToken);
        if (data?.refreshToken)
          localStorage.setItem("refreshToken", data.refreshToken);
        if (data?.user) localStorage.setItem("me", JSON.stringify(data.user));
        
        if (data?.user?.isFirstTimeLogin) {
          router.replace("/reset-password");
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Abstract Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <Card className="w-full max-w-lg border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient-x" />
        
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
              Sri Ananda
              <span className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-1 rounded uppercase tracking-widest border border-primary/20">
                Console
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Authorized personnel only. Please sign in.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-slate-300 font-medium ml-1">Account Identifier</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Email or phone number"
                    value={form.identifier}
                    onChange={(e) => onChange("identifier", e.target.value)}
                    disabled={loginMut.isPending}
                    required
                    className="h-12 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-primary/50 transition-all pl-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="password" className="text-slate-300 font-medium">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs text-slate-500 hover:text-primary transition-colors" type="button">
                    Forgot Access?
                  </Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => onChange("password", e.target.value)}
                    disabled={loginMut.isPending}
                    className="h-12 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-primary/50 transition-all pl-11 pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    onClick={() => setShowPw((v) => !v)}
                    disabled={loginMut.isPending}
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {errMsg && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-red-500">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{errMsg}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 px-8 pt-4 pb-12">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold transition-all rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
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
                    <span>Enter Console</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </Button>
            
            <p className="text-center text-slate-500 text-sm">
              Sri Ananda Educational Complex &copy; {new Date().getFullYear()}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
       <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a]">
         <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
       </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
