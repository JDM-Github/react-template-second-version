import { toast } from "sonner";

interface ConfirmOptions {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    duration?: number;
}

export function confirm({
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    duration = Infinity,
}: ConfirmOptions) {
    let toastId: string | number;

    toastId = toast(message, {
        duration,
        dismissible: true,
        description: (
            <div className="flex gap-2 mt-2">
                <button
                    className="flex-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-surface-2 transition-colors"
                    onClick={() => {
                        toast.dismiss(toastId);
                        onCancel?.();
                    }}
                >
                    {cancelLabel}
                </button>
                <button
                    className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                    onClick={async () => {
                        toast.dismiss(toastId);
                        await onConfirm();
                    }}
                >
                    {confirmLabel}
                </button>
            </div>
        ),
    });

    return toastId;
}