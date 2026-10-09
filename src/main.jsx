import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";

async function bootstrap() {
  // Real backend is live (see docs/api-contract.md) and is the default. Set
  // VITE_USE_MOCK=true to fall back to an in-browser mock matching the same
  // contract, e.g. when the Spring Boot API isn't running locally.
  if (import.meta.env.VITE_USE_MOCK === "true") {
    await import("./mocks/server.js");
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
