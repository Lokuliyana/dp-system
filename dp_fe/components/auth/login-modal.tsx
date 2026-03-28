"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onSuccess }: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="p-0 border-none bg-transparent shadow-none max-w-lg"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <LoginForm 
          onSuccess={onSuccess}
          className="shadow-2xl"
        />
      </DialogContent>
    </Dialog>
  );
}
