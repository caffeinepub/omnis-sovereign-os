import type { backendInterface as ExtBackend } from "@/backend.d";
import { SessionWarningDialog } from "@/components/auth/SessionWarningDialog";
import { CommanderValidationBanner } from "@/components/layout/CommanderValidationBanner";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { NetworkModeProvider } from "@/contexts/NetworkModeContext";
import {
  PermissionsProvider,
  usePermissions,
} from "@/contexts/PermissionsContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegistrationGatePage = lazy(() => import("@/pages/RegistrationGatePage"));
const ValidateCommanderPage = lazy(
  () => import("@/pages/ValidateCommanderPage"),
);
const HubPage = lazy(() => import("@/pages/HubPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const PersonnelPage = lazy(() => import("@/pages/PersonnelPage"));
const EmailDirectoryPage = lazy(() => import("@/pages/EmailDirectoryPage"));
const FileStoragePage = lazy(() => import("@/pages/FileStoragePage"));
const AccessMonitoringPage = lazy(() => import("@/pages/AccessMonitoringPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const AuditLogPage = lazy(() => import("@/pages/AuditLogPage"));
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const GovernancePage = lazy(() => import("@/pages/GovernancePage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const ProfilePreviewPage = lazy(() => import("@/pages/ProfilePreviewPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const PendingVerificationPage = lazy(
  () => import("@/pages/PendingVerificationPage"),
);
const NetworkModeSetupPage = lazy(() => import("@/pages/NetworkModeSetupPage"));
const TestLabPage = lazy(() => import("@/pages/TestLabPage"));
const MyProfilePage = lazy(() => import("@/pages/MyProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const WorkspaceSetupPage = lazy(() => import("@/pages/WorkspaceSetupPage"));
const ClaimCommanderPage = lazy(() => import("@/pages/ClaimCommanderPage"));

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

  // Idle warning state driven by useIdleTimer
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { actor } = useActor();

  // Set Online presence when authenticated
  useEffect(() => {
    if (isAuthenticated && actor) {
      void (actor as unknown as ExtBackend)
        .setPresence("Online")
        .catch(() => {});
    }
  }, [isAuthenticated, actor]);

  // Hard-reload logout: call authClient.logout() then immediately navigate to
  // /login via window.location so the entire React tree (including the
  // AuthClient instance) is rebuilt from scratch. This prevents the race where
  // clear() sets authClient→undefined, the init useEffect re-runs, briefly
  // sets loginStatus to "initializing", and leaves the Sign In button disabled.
  const handleLogOut = () => {
    if (actor) {
      void (actor as unknown as ExtBackend)
        .setPresence("Offline")
        .catch(() => {})
        .finally(() => {
          clear();
          window.location.href = "/login";
        });
    } else {
      clear();
      window.location.href = "/login";
    }
  };

  // Idle timer — only active while a real (non-anonymous) identity is present.
  // Warns at 20 min, expires at 22 min. Wires into the existing
  // SessionWarningDialog via showIdleWarning state.
  useIdleTimer({
    onWarn: () => {
      if (isAuthenticated) setShowIdleWarning(true);
    },
    onExpire: () => {
      if (isAuthenticated) {
        setShowIdleWarning(false);
        clear();
        window.location.href = "/login";
      }
    },
    warnAfterMs: 20 * 60 * 1000,
    expireAfterMs: 22 * 60 * 1000,
  });

  useEffect(() => {
    // Redirect to login if: not initializing AND no identity present
    // This covers both the normal logout case and the post-clear idle state
    if (
      !isInitializing &&
      (!identity || identity.getPrincipal().isAnonymous())
    ) {
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
      <CommandPalette />
      {/* Idle warning from useIdleTimer (20-min inactivity) */}
      <SessionWarningDialog
        open={showIdleWarning}
        onStayLoggedIn={() => setShowIdleWarning(false)}
        onLogOut={handleLogOut}
      />
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
  return (
    <Suspense fallback={<PageLoader />}>
      <AccessMonitoringPage />
    </Suspense>
  );
}

// --- Profile Preview guard (S2 only) ---
function ProfilePreviewGuard() {
  const { isS2Admin, isLoading } = usePermissions();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isS2Admin) {
      void router.navigate({ to: "/personnel" });
    }
  }, [isS2Admin, isLoading, router]);
  if (isLoading || !isS2Admin) return <PageLoader />;
  return (
    <Suspense fallback={<PageLoader />}>
      <ProfilePreviewPage />
    </Suspense>
  );
}

// --- Admin guard (S2 only) ---
function AdminGuard() {
  const { isS2Admin, isLoading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isS2Admin) {
      void router.navigate({ to: "/" });
    }
  }, [isS2Admin, isLoading, router]);

  if (isLoading || !isS2Admin) return <PageLoader />;
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminPage />
    </Suspense>
  );
}

// --- Route definitions ---
const rootRoute = createRootRoute({
  component: () => (
    <NetworkModeProvider>
      <Outlet />
    </NetworkModeProvider>
  ),
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
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <RegistrationGatePage />
    </Suspense>
  ),
});

const validateCommanderRoute = createRoute({
  getParentRoute: () => rootRoute,
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
      <FileStoragePage />
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

const notificationsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/notifications",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <NotificationsPage />
    </Suspense>
  ),
});

const auditLogRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/audit-log",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AuditLogPage />
    </Suspense>
  ),
});

const announcementsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/announcements",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AnnouncementsPage />
    </Suspense>
  ),
});

const calendarRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/calendar",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <CalendarPage />
    </Suspense>
  ),
});

const tasksRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/tasks",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TasksPage />
    </Suspense>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/settings",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SettingsPage />
    </Suspense>
  ),
});

const governanceRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/governance",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <GovernancePage />
    </Suspense>
  ),
});

const helpRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/help",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HelpPage />
    </Suspense>
  ),
});

const profilePreviewRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/profile-preview",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ProfilePreviewGuard />
    </Suspense>
  ),
});

const testLabRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/test-lab",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TestLabPage />
    </Suspense>
  ),
});

const myProfileRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/my-profile",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MyProfilePage />
    </Suspense>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/admin",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AdminGuard />
    </Suspense>
  ),
});

const workspaceSetupRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/workspace-setup",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <WorkspaceSetupPage />
    </Suspense>
  ),
});

const claimCommanderRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/claim-commander",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ClaimCommanderPage />
    </Suspense>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <OnboardingPage />
    </Suspense>
  ),
});

const pendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pending",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <PendingVerificationPage />
    </Suspense>
  ),
});

const networkModeSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/network-mode-setup",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <NetworkModeSetupPage />
    </Suspense>
  ),
});

// --- Route tree ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  onboardingRoute,
  pendingRoute,
  networkModeSetupRoute,
  registerRoute,
  validateCommanderRoute,
  authRoute.addChildren([
    hubRoute,
    documentsRoute,
    messagesRoute,
    personnelRoute,
    emailDirectoryRoute,
    fileStorageRoute,
    monitoringRoute,
    notificationsRoute,
    auditLogRoute,
    announcementsRoute,
    calendarRoute,
    tasksRoute,
    settingsRoute,
    governanceRoute,
    helpRoute,
    profilePreviewRoute,
    testLabRoute,
    myProfileRoute,
    adminRoute,
    workspaceSetupRoute,
    claimCommanderRoute,
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
