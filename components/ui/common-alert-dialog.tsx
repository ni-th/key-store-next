"use client"

import * as React from "react"
import { CheckCircle2Icon, CircleAlertIcon, CircleHelpIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type CommonAlertVariant = "delete" | "warning" | "confirm" | "success"

type CommonAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: CommonAlertVariant
  closeOnOverlayClick?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  confirmLoading?: boolean
  disableConfirm?: boolean
  hideCancel?: boolean
  contentClassName?: string
}

const variantConfig: Record<
  CommonAlertVariant,
  {
    title: string
    confirmText: string
    confirmVariant: React.ComponentProps<typeof Button>["variant"]
    icon: React.ComponentType<React.ComponentProps<"svg">>
    iconClassName: string
  }
> = {
  delete: {
    title: "Delete Item",
    confirmText: "Delete",
    confirmVariant: "destructive",
    icon: Trash2Icon,
    iconClassName: "text-destructive",
  },
  warning: {
    title: "Warning",
    confirmText: "Continue",
    confirmVariant: "secondary",
    icon: CircleAlertIcon,
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  confirm: {
    title: "Please Confirm",
    confirmText: "Confirm",
    confirmVariant: "default",
    icon: CircleHelpIcon,
    iconClassName: "text-primary",
  },
  success: {
    title: "Success",
    confirmText: "Done",
    confirmVariant: "default",
    icon: CheckCircle2Icon,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
}

function CommonAlertDialog({
  open,
  onOpenChange,
  variant,
  closeOnOverlayClick = true,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  confirmLoading = false,
  disableConfirm = false,
  hideCancel,
  contentClassName,
}: CommonAlertDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const shouldHideCancel = hideCancel ?? variant === "success"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", contentClassName)}
        onPointerDownOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader className="gap-3">
          <div className="flex items-start gap-2">
            <Icon className={cn("mt-0.5 size-4 shrink-0", config.iconClassName)} />
            <div className="space-y-1">
              <DialogTitle>{title ?? config.title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          {!shouldHideCancel ? (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
          ) : null}

          <Button
            type="button"
            variant={config.confirmVariant}
            onClick={onConfirm}
            disabled={confirmLoading || disableConfirm}
          >
            {confirmLoading ? "Please wait..." : confirmText ?? config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CommonAlertDialog }
export type { CommonAlertDialogProps, CommonAlertVariant }
