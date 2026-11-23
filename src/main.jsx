// main.jsx
// Starts the app: the router, and one shared API cache (TanStack Query) for every page.
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

// One cache for the whole app. These are the defaults for every API call (each can override them).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // reuse a reply for 5 minutes before refreshing it
      retry: 1,                      // if a call fails, try once more
      refetchOnWindowFocus: false,   // don't reload just because the user clicks back into the tab
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);