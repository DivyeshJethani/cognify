import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Curriculum from "./pages/Curriculum";
import Profile from "./pages/Profile";
import ComingSoon from "./pages/ComingSoon";
import Resources from "./pages/Resources";
import Session from "./pages/Session";
import Player from "./pages/Player";

/**
 * Auth/onboarding guard as a real component — hooks are called unconditionally
 * at the top level, and redirects happen inside useEffect (never during render).
 */
function GuardedRoute({
  path,
  component: Component,
  requireAuth = true,
  requireOnboarding = true,
}: {
  path: string;
  component: React.ComponentType;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}) {
  return (
    <Route path={path}>
      <GuardInner requireAuth={requireAuth} requireOnboarding={requireOnboarding}>
        <Component />
      </GuardInner>
    </Route>
  );
}

function GuardInner({
  requireAuth,
  requireOnboarding,
  children,
}: {
  requireAuth: boolean;
  requireOnboarding: boolean;
  children: React.ReactNode;
}) {
  const { auth } = useApp();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (requireAuth && auth.kind === "logged-out") {
      navigate("/login");
      return;
    }
    if (
      requireAuth &&
      requireOnboarding &&
      auth.kind === "logged-in" &&
      !(auth as { onboarded: boolean }).onboarded
    ) {
      navigate("/onboarding");
      return;
    }
  }, [requireAuth, requireOnboarding, auth, navigate]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <GuardedRoute path={"/onboarding"} component={Onboarding} requireOnboarding={false} />
      <GuardedRoute path={"/dashboard"} component={Dashboard} />
      <GuardedRoute path={"/curriculum"} component={Curriculum} />
      <GuardedRoute path={"/profile"} component={Profile} />
      <GuardedRoute path={"/resources/:topicId"} component={Resources} />
      <GuardedRoute path={"/session/:resourceId"} component={Session} />
      <GuardedRoute path={"/player/:resourceId"} component={Player} />
      <Route path={"/timetable"}>
        {() => (
          <ComingSoon
            overline="Timetable"
            title="Personalised timetable"
            blurb="Your weekly study plan, built around your peak focus hours and spaced-retention schedule."
            capabilities={[
              "Auto-generated weekly timetable from your Learning DNA",
              "Peak-focus-hour scheduling",
              "Session blocks sized to your attention window",
              "Conflict handling with school & extracurriculars",
            ]}
          />
        )}
      </Route>
      <Route path={"/goals"}>
        {() => (
          <ComingSoon
            overline="Stretch Goals"
            title="Stretch goals & resilience"
            blurb="Ambitious targets with struggle analysis, so difficulty becomes data instead of discouragement."
            capabilities={[
              "Stretch goal definition with deadline tracking",
              "Resilience & struggle analysis",
              "AI teach-back and peer teaching missions",
              "Credits rewards for goal progress",
            ]}
          />
        )}
      </Route>
      <Route path={"/community"}>
        {() => (
          <ComingSoon
            overline="Community"
            title="Study groups & peer teaching"
            blurb="Learn by teaching. Form groups, exchange teach-back sessions and compare learning DNA insights."
            capabilities={[
              "Study group formation",
              "Peer teaching sessions with mastery credits",
              "AI teach-back assessments",
              "Group revision tests",
            ]}
          />
        )}
      </Route>
      <Route path={"/credits"}>
        {() => (
          <ComingSoon
            overline="Credits"
            title="Credits ledger"
            blurb="Earned for practice, revision and teaching — spent on stretch resources and group sessions."
            capabilities={[
              "Credits balance & transaction history",
              "Earning rules for practice, revision & teach-back",
              "Spending on premium resources",
              "Weekly earning reports",
            ]}
          />
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <AppProvider>
            <Router />
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
