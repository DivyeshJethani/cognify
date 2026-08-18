/**
 * COGNIFY — App State Context
 * Holds authentication (demo), onboarding selections, and student profile.
 * Persists to localStorage so refresh keeps the logged-in state.
 * When the NestJS API is connected, this becomes the API client layer.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  boards,
  creditsBalance,
  goals,
  learningDNA,
  recentActivity,
  revisionDue,
  studentProfile as defaultProfile,
  todaysPath,
  weakTopics,
} from "@/lib/mockData";
import type { CreditsBalance, Goal, LearningDNA, StudentProfile, TodayPathItem } from "@/lib/types";

const STORAGE_KEY = "cognify.state.v1";

interface OnboardingSelection {
  boardId: string | null;
  classId: string | null;
  subjectIds: string[];
  learningGoal: string;
}

export type AuthState =
  | { kind: "logged-out" }
  | { kind: "logged-in"; email: string; name: string; onboarded: boolean };

interface AppState {
  auth: AuthState;
  onboarding: OnboardingSelection;
  profile: StudentProfile;
  credits: CreditsBalance;
  dna: LearningDNA;
  goalsList: Goal[];
  todayPath: TodayPathItem[];
  weakTopicsList: ReturnType<typeof weakTopics>;
  revisionDueList: ReturnType<typeof revisionDue>;
  activity: typeof recentActivity;
  login: (name: string, email: string) => void;
  logout: () => void;
  setOnboarding: (next: Partial<OnboardingSelection>) => void;
  completeOnboarding: () => void;
  setGoal: (id: string, progress: number) => void;
  clearAll: () => void;
}

const defaultOnboarding: OnboardingSelection = {
  boardId: null,
  classId: null,
  subjectIds: [],
  learningGoal: "",
};

const emptyState: AppState = {
  auth: { kind: "logged-out" },
  onboarding: defaultOnboarding,
  profile: defaultProfile,
  credits: creditsBalance,
  dna: learningDNA,
  goalsList: goals,
  todayPath: todaysPath,
  weakTopicsList: weakTopics(),
  revisionDueList: revisionDue(),
  activity: recentActivity,
  login: () => {},
  logout: () => {},
  setOnboarding: () => {},
  completeOnboarding: () => {},
  setGoal: () => {},
  clearAll: () => {},
};

const AppContext = createContext<AppState>(emptyState);

export function useApp() {
  return useContext(AppContext);
}

function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Re-attach derived data which isn't persisted
    return {
      ...emptyState,
      ...parsed,
      credits: creditsBalance,
      dna: learningDNA,
      todayPath: todaysPath,
      weakTopicsList: weakTopics(),
      revisionDueList: revisionDue(),
      activity: recentActivity,
    } as AppState;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() ?? emptyState);

  useEffect(() => {
    const { auth, onboarding, profile, goalsList } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ auth, onboarding, profile, goalsList })
    );
  }, [state]);

  const login = useCallback((name: string, email: string) => {
    setState((s) => ({
      ...s,
      auth: { kind: "logged-in", email, name, onboarded: s.onboarding.boardId !== null },
    }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState((s) => ({ ...s, auth: { kind: "logged-out" }, onboarding: defaultOnboarding }));
  }, []);

  const setOnboarding = useCallback((next: Partial<OnboardingSelection>) => {
    setState((s) => ({
      ...s,
      onboarding: { ...s.onboarding, ...next },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => {
      const board = boards.find((b) => b.id === s.onboarding.boardId);
      const cls = board?.classes.find((c) => c.id === s.onboarding.classId);
      const profile: StudentProfile = {
        ...s.profile,
        name: s.auth.kind === "logged-in" ? s.auth.name : s.profile.name,
        board: board?.name ?? s.profile.board,
        className: cls?.name ?? s.profile.className,
        subjectIds: s.onboarding.subjectIds,
        learningGoal: s.onboarding.learningGoal || s.profile.learningGoal,
      };
      const currentEmail = s.auth.kind === "logged-in" ? s.auth.email : "";
      return {
        ...s,
        profile,
        auth: { kind: "logged-in", email: currentEmail, name: profile.name, onboarded: true },
        onboarding: { ...s.onboarding },
      };
    });
  }, []);

  const setGoal = useCallback((id: string, progress: number) => {
    setState((s) => ({
      ...s,
      goalsList: s.goalsList.map((g) => (g.id === id ? { ...g, progress } : g)),
    }));
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(emptyState);
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        setOnboarding,
        completeOnboarding,
        setGoal,
        clearAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
