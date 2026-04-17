import { useTheme } from "@/contexts/theme-provider";
import { Toaster as Sonner, toast as sonnerToast, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";
import { process } from "@/lib/toast-process";
import { confirm } from "@/lib/toast-confirm";
import React from "react";

type CustomToast = typeof sonnerToast & {
  process: typeof process;
  confirm: typeof confirm;
};

const toast = Object.assign(sonnerToast, { process, confirm }) as CustomToast;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      duration={1500}
      className="toaster group"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border !shadow-lg !font-sans",
          title: "!text-sm !font-medium",
          description: "!text-xs !opacity-70",
          icon: "!mt-0",
          closeButton: "!rounded-lg !border-[var(--color-border)] !bg-[var(--color-surface)] !text-[var(--color-text-muted)] hover:!text-[var(--color-text)] hover:!bg-[var(--color-surface-2)]", 
          actionButton: "!rounded-lg !text-xs !font-medium",
          cancelButton: "!rounded-lg !text-xs !font-medium",
          success: "[&>[data-icon]]:!text-[var(--color-success)]",
          error: "[&>[data-icon]]:!text-[var(--color-error)]",
          warning: "[&>[data-icon]]:!text-[var(--color-warning)]",
          info: "[&>[data-icon]]:!text-[var(--color-info)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-text)",
          "--normal-border": "var(--color-border)",

          "--success-bg": "var(--color-surface)",
          "--success-text": "var(--color-text)",
          "--success-border": "var(--color-success-border)",

          "--error-bg": "var(--color-surface)",
          "--error-text": "var(--color-text)",
          "--error-border": "var(--color-error-border)",

          "--warning-bg": "var(--color-surface)",
          "--warning-text": "var(--color-text)",
          "--warning-border": "var(--color-warning-border)",

          "--info-bg": "var(--color-surface)",
          "--info-text": "var(--color-text)",
          "--info-border": "var(--color-info-border)",

          "--border-radius": "12px",
          "--font-family": "var(--font-sans)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };