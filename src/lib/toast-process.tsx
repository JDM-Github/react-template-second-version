// lib/toast-process.tsx
import { toast } from "sonner";

let overlayElement: HTMLDivElement | null = null;

function showOverlay() {
    if (overlayElement) return;
    overlayElement = document.createElement("div");
    overlayElement.style.position = "fixed";
    overlayElement.style.inset = "0";
    overlayElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlayElement.style.backdropFilter = "blur(4px)";
    overlayElement.style.zIndex = "9998";
    overlayElement.style.cursor = "wait";
    document.body.appendChild(overlayElement);
}

function hideOverlay() {
    if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
    }
}

interface ProcessOptions<T> {
    task: () => Promise<T>;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    cancelMessage?: string;
    dismissible?: boolean;
    duration?: number;
}

export async function process<T>({
    task,
    loadingMessage = "Processing...",
    successMessage = "Success!",
    errorMessage = "Something went wrong",
    cancelMessage = "Process cancelled.",
    dismissible = false,
    duration = 3000,
}: ProcessOptions<T>): Promise<T> {
    showOverlay();

    let cancelled = false;
    let toastId: string | number;
    const taskPromise = task();

    toastId = toast.loading(loadingMessage, {
        duration: Infinity,
        dismissible,
        cancel: dismissible ? {
            label: "Cancel",
            onClick: () => {
                cancelled = true;
                hideOverlay();
                toast.dismiss(toastId);
                toast.info(cancelMessage, { duration }); 
            },
        } : undefined,
    });

    try {
        const result = await taskPromise;
        if (cancelled) {
            toast.dismiss(toastId);
            throw new Error("Process cancelled by user");
        }
        toast.dismiss(toastId);
        toast.success(successMessage, { duration });
        return result;
    } catch (error) {
        if (cancelled) throw error;

        toast.dismiss(toastId);
        toast.error(errorMessage, { duration });
        throw error;
    } finally {
        if (!cancelled) {
            setTimeout(() => hideOverlay(), 500);
        }
    }
}