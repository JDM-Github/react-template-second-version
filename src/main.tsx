// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-provider";
import { RouteProvider } from "@/contexts/route-provider";
import App from "./App";
import "./index.css";
import { CommandGroupHeadingStyle, CommandItemStyle } from "./components/ui/command";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<RouteProvider>
				<ThemeProvider defaultTheme="dark" storageKey="app-theme">
					<TooltipProvider>
						<CommandGroupHeadingStyle />
						<CommandItemStyle />
						<App />
					</TooltipProvider>
				</ThemeProvider>
			</RouteProvider>
		</BrowserRouter>
	</StrictMode>
);