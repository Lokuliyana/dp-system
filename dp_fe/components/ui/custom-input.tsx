"use client"

import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onKeyDown?: (e: React.KeyboardEvent) => void
  onBlur?: () => void
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, type = "text", onKeyDown, onBlur, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("w-full h-8 px-2 bg-transparent border-0 outline-none focus:bg-accent rounded", className)}
        ref={ref}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        {...props}
      />
    )
  },
)

CustomInput.displayName = "CustomInput"
