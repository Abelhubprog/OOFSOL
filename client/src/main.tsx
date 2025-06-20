import { createRoot } from "react-dom/client";
import DynamicProvider from './lib/dynamic-working';
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <DynamicProvider>
    <App />
  </DynamicProvider>
);
