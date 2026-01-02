"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Reusable confirmation dialog component
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  loading = false,
}) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90"
                : ""
            }
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to use confirmation dialog
 */
export function useConfirmDialog() {
  const [state, setState] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: null,
    variant: "default",
  });

  const confirm = (options) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title || "Are you sure?",
        description: options.description || "",
        variant: options.variant || "default",
        onConfirm: () => {
          resolve(true);
        },
      });
    });
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setState((prev) => ({ ...prev, open: false }));
    }
  };

  return {
    ConfirmDialog: () => (
      <ConfirmDialog
        open={state.open}
        onOpenChange={handleOpenChange}
        title={state.title}
        description={state.description}
        onConfirm={state.onConfirm}
        variant={state.variant}
      />
    ),
    confirm,
  };
}
