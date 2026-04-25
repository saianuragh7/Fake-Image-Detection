import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import ErrorBoundary from "./components/ErrorBoundary"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")
const root = createRoot(rootElement)

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
