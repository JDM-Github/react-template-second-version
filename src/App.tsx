// App.tsx
import { Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Layout } from "@/layout"
import Root from "@/routes/root"

export default function App() {
	return (
		<>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<Root />} />
					{/* Add more routes here — they all inherit the shell */}
					{/* <Route path="/users" element={<Users />} /> */}
					{/* <Route path="/analytics" element={<Analytics />} /> */}
					{/* <Route path="/settings" element={<Settings />} /> */}
				</Route>
			</Routes>
			<Toaster position="top-right" richColors />
		</>
	)
}