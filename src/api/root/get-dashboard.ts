
// src/api/root/get-dashboard.ts
import { toast } from "@/components/ui/sonner";
// import RequestHandler from "@/connection/request_handler";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export interface DashboardData {
    message: string;
    data: {
        widgets: string[];
        user: string;
    };
}

/**
 * Fetch dashboard data with toast.process overlay.
 * @returns Promise resolving to the dashboard data.
 */
export async function fetchDashboard(): Promise<DashboardData> {
    return toast.process<DashboardData>({
        task: async () => {
            // const result = await RequestHandler.fetchData("GET", "root/get-dashboard");

            // if (!result.success) {
            //     throw new Error(result.message || "Failed to fetch dashboard");
            // }
            await delay(3000);
            const result = {
                message: "Testing API",
                data: {
                    widgets: ["1", "2", "3"],
                    user: "User"
                }
            }
            return result as DashboardData;
        },
        loadingMessage: "Loading dashboard...",
        successMessage: "Dashboard ready",
        errorMessage: "Could not load dashboard",
        dismissible: false,
    });
}

/**
 * Raw version – no toast overlay, just returns the data or throws.
 * Useful inside useEffect / manual state management.
 * Includes the same 3‑second artificial delay.
 */
export async function fetchDashboardRaw(): Promise<DashboardData> {
    // Simulate network delay
    await delay(3000);

    // Mock response
    const result = {
        message: "Testing API (raw)",
        data: {
            widgets: ["A", "B", "C"],
            user: "Raw User"
        }
    };

    // Real implementation:
    // const result = await RequestHandler.fetchData("GET", "root/get-dashboard");
    // if (!result.success) {
    //     throw new Error(result.message || "Failed to fetch dashboard");
    // }
    // return result as DashboardData;

    return result as DashboardData;
}