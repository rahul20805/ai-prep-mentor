import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import LecturesPage from "./pages/LecturesPage";
import LoginPage from "./pages/LoginPage";
import MentorPage from "./pages/MentorPage";
import PracticePage from "./pages/PracticePage";
import TimetablePage from "./pages/TimetablePage";

// ─── Auth guard component ─────────────────────────────────────────────────────
// IMPORTANT: Never throw redirect() inside a React component's render —
// it will be caught by the ErrorBoundary, showing "Something went wrong".
// Instead use useEffect + navigate for imperative redirects from render.

function ProtectedLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  // Redirect to login if definitely not authenticated (not during init)
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login", replace: true });
    }
  }, [identity, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your session…</p>
        </div>
      </div>
    );
  }

  // Not yet redirected but no identity — show blank while redirect fires
  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// ─── Root route ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Outlet,
});

// ─── Login route ──────────────────────────────────────────────────────────────

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// ─── Protected parent route ───────────────────────────────────────────────────

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

// ─── Page routes (children of protectedRoute) ─────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const timetableRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/timetable",
  component: TimetablePage,
});

const practiceRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/practice",
  component: PracticePage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const mentorRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/mentor",
  component: MentorPage,
});

const lecturesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/lectures",
  component: LecturesPage,
});

// ─── Router setup ─────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    indexRoute,
    dashboardRoute,
    timetableRoute,
    practiceRoute,
    analyticsRoute,
    mentorRoute,
    lecturesRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
