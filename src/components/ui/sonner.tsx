"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0a1018]/90 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-white/40",
          actionButton:
            "group-[.toast]:bg-cyan-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-white/60",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
