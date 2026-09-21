import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./styles/global.css";
import { SessionEvents } from "./hooks/useSession";
import { getApiErrorStatus } from "./api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => failureCount < 1 && ![401, 403].includes(getApiErrorStatus(error) ?? 0),
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionEvents />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
