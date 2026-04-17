import { createContext, useContext, ReactNode, useMemo } from "react";
import { useLocation } from "react-router-dom";

type RouteContextValue = {
    folder: string;
    pathname: string;
};

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export const RouteProvider = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation();

    const folder = useMemo(() => {
        const segments = pathname.replace(/^\/|\/$/g, "").split("/");
        return segments[0] || "root";
    }, [pathname]);

    return (
        <RouteContext.Provider value={{ folder, pathname }}>
            {children}
        </RouteContext.Provider>
    );
};

export const useRoute = () => {
    const context = useContext(RouteContext);
    if (!context) {
        throw new Error("useRoute must be used within a RouteProvider");
    }
    return context;
};
