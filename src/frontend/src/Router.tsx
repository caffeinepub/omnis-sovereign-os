import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";
import { SessionWarningDialog } from "@/components/auth/SessionWarningDialog";
import { CommanderValidationBanner } from "@/components/layout/CommanderValidationBanner";
import {
  PermissionsProvider,
  usePermissions,
} from "@/contexts/PermissionsContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegistrationGatePage = lazy(() => import("@/pages/RegistrationGatePage"));
const ValidateCommanderPage = lazy(
  () => import("@/pages/ValidateCommanderPage"),
);
const HubPage = lazy(() => import("@/pages/HubPage"));
const StubPage = lazy(() => import("@/pages/StubPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const PersonnelPage = lazy(() => import("@/pages/PersonnelPage"));
const EmailDirectoryPage = lazy(() => import("@/pages/EmailDirectoryPage"));

// --- Page loader ---
function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading...
      </p>
    </div>
  );
}

// --- Authenticated Layout ---
function AuthenticatedLayout() {
  const { identity, isInitializing, isLoginIdle, clear } =
    useInternetIdentity();
  const router = useRouter();
  const { showWarning, showExpired, handleStayLoggedIn, handleExpiredSignIn } =
    useSessionGuard();

  useEffect(() => {
    // Redirect to login if: not initializing AND no identity present
    // This covers both the normal logout case and the post-clear idle state
    if (!isInitializing && !identity) {
      void router.navigate({ to: "/login" });
    }
  }, [identity, isInitializing, router]);

  // Show initializing only briefly — if idle with no identity, don't block
  if (isInitializing && !isLoginIdle) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Initializing...
        </p>
      </div>
    );
  }

  if (!identity) {
    return null;
  }

  return (
    <PermissionsProvider>
      <CommanderValidationBanner />
      <Outlet />
      <SessionWarningDialog
        open={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogOut={clear}
      />
      {showExpired && <SessionExpiredModal onSignIn={handleExpiredSignIn} />}
    </PermissionsProvider>
  );
}

// --- Monitoring guard (S2 only) ---
function MonitoringPage() {
  const { isS2Admin, isLoading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isS2Admin) {
      void router.navigate({ to: "/" });
    }
  }, [isS2Admin, isLoading, router]);

  if (isLoading || !isS2Admin) return <PageLoader />;
  return <StubPage title="Access Monitoring" />;
}

// --- Route definitions ---
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LoginPage />
    </Suspense>
  ),
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthenticatedLayout,
});

const hubRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HubPage />
    </Suspense>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/register",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <RegistrationGatePage />
    </Suspense>
  ),
});

const validateCommanderRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/validate-commander",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ValidateCommanderPage />
    </Suspense>
  ),
});

const documentsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/documents",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DocumentsPage />
    </Suspense>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/messages",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MessagesPage />
    </Suspense>
  ),
});

const personnelRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/personnel",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <PersonnelPage />
    </Suspense>
  ),
});

const emailDirectoryRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/email-directory",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <EmailDirectoryPage />
    </Suspense>
  ),
});

const fileStorageRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/file-storage",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <StubPage title="File Storage" />
    </Suspense>
  ),
});

const monitoringRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/monitoring",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MonitoringPage />
    </Suspense>
  ),
});

// --- Route tree ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  authRoute.addChildren([
    hubRoute,
    registerRoute,
    validateCommanderRoute,
    documentsRoute,
    messagesRoute,
    personnelRoute,
    emailDirectoryRoute,
    fileStorageRoute,
    monitoringRoute,
  ]),
]);

// --- Create router ---
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
