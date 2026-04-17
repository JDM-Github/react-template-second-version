// lib/toast-types.d.ts
import { ExternalToast } from "sonner";

declare module "sonner" {
    interface ToastT {
        process?: typeof import("./toast-process").process;
        confirm?: typeof import("./toast-confirm").confirm;
    }
}