import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DynamicProvider from './lib/dynamic';
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <DynamicProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </DynamicProvider>
);
