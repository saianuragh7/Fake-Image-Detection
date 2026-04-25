import { Switch, Route, Router as WouterRouter } from "wouter";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteBackground } from "@/components/SiteBackground";

const Home = lazy(() => import("@/pages/home"));
const Detect = lazy(() => import("@/pages/detect"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ScanDetail = lazy(() => import("@/pages/scan"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/detect" component={Detect} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/scan/:id" component={ScanDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SiteBackground />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Suspense
            fallback={
              <div className="min-h-screen px-6 pt-28 text-foreground">
                <div className="mx-auto h-2 w-40 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
                </div>
              </div>
            }
          >
            <Router />
          </Suspense>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
