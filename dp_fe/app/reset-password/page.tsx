"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/masterdata/auth.service";
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
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      await authService.resetPassword(password);
      toast.success("Password reset successfully! Please login again.");
      
      // Update local storage user if exists
      const meStr = localStorage.getItem("me");
      if (meStr) {
        const me = JSON.parse(meStr);
        me.isFirstTimeLogin = false;
        localStorage.setItem("me", JSON.stringify(me));
      }
      
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password.";
      setError(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <Card className="w-full max-w-lg border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient-x" />
        
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-white">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              This is your first login. Please set a new password to continue.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium ml-1">New Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    required
                    className="h-12 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-primary/50 transition-all pl-11 pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-medium ml-1">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    required
                    className="h-12 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-primary/50 transition-all pl-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-400 flex items-center gap-3 border-l-4 border-l-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 px-8 pt-4 pb-12">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold transition-all rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
              disabled={isPending}
            >
              <span className="flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
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
      </Card>
    </div>
  );
}
