/**
 * COGNIFY — Application shell
 * Deep Ink sidebar ("the instrument ledger") + ivory content.
 * Marginalia labels, mono stats, hairline separators. Mobile: slide-in sheet.
 */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { LOGO_URL } from "@/components/cognify/Primitives";
import {
  Atom,
  BarChart3,
  BookOpen,
  Bookmark,
  CalendarDays,
  Command,
  CreditCard,
  Library,
  LogOut,
  Menu,
  PlayCircle,
  Settings,
  Target,
  Users,
  UserSquare2,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchKnowledge } from "@/lib/discoverySearch";
import { getRecentSearches, pushRecentSearch } from "@/lib/journeyData";
import {
  classSubjects,
  getStudyContext,
  onContextChange,
  saveContext,
} from "@/lib/studyContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: Command },
  { href: "/curriculum", label: "Curriculum Explorer", icon: BookOpen },
  { href: "/library", label: "Resource Library", icon: Library },
  { href: "/saved", label: "My Saved Resources", icon: Bookmark },
  { href: "/continue", label: "Continue Learning", icon: PlayCircle },
  { href: "/profile", label: "Learning DNA", icon: Atom },
  { href: "/adaptive", label: "Adaptive Lab", icon: Zap },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/goals", label: "Stretch Goals", icon: Target },
  { href: "/community", label: "Study Groups", icon: Users },
  { href: "/credits", label: "Credits", icon: CreditCard },
];

const comingSoon = new Set(["/credits"]);

const KIND_GLYPH: Record<string, string> = {
  topic: "T",
  resource: "R",
  revision: "V",
  practice: "P",
  path: "→",
  subject: "S",
  chapter: "C",
};

function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const grouped = searchKnowledge(query);
  const hasResults = grouped.groups.some((g) => g.items.length > 0);

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  // Global shortcut: Cmd/Ctrl + K opens the card catalogue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mx-5 flex items-center justify-between border border-white/15 bg-white/[0.04] px-3 py-2 text-left transition-colors hover:border-teal/50"
      >
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45">
          Search the laboratory…
        </span>
        <span className="ml-3 border border-white/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
          ⌘K
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-ink/20 bg-ivory p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="border-b border-ink/10 px-4 pt-4">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, resources, lectures, your notes…"
              className="w-full border-0 bg-transparent py-2 font-serif text-[15px] text-ink outline-none placeholder:text-ink/30"
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {grouped.groups.every((g) => g.items.length === 0) && query.length >= 2 && (
              <p className="px-4 py-8 font-serif text-[13.5px] leading-relaxed text-muted-foreground">
                The catalogue has no entry for “{query.trim()}” yet —
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/50">
                  {" "}try a subject, chapter or topic instead.
                </span>
              </p>
            )}
            {query.length < 2 && (
              <>
                {recent.length > 0 && (
                  <div className="border-b border-ink/10 px-4 py-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-teal-dark">
                      Recent searches
                    </span>
                    <ul className="mt-2 space-y-0.5">
                      {recent.map((r) => (
                        <li key={r}>
                          <button
                            type="button"
                            onClick={() => setQuery(r)}
                            className="flex w-full items-center gap-2.5 border-b border-dotted border-ink/10 py-2 text-left text-[13px] text-ink transition-colors hover:bg-ink/[0.04]"
                          >
                            <span className="font-mono text-[9px] text-ink/40">↻</span>
                            {r}
                            <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              Search
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className={recent.length > 0 ? "border-b border-ink/10 px-4 py-3" : "px-4 py-3"}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-teal-dark">
                    {recent.length > 0 ? "Destinations" : "Where to begin"}
                  </span>
                  <ul className="mt-2 space-y-0.5">
                    {navItems.slice(0, 4).map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 border-b border-dotted border-ink/10 py-2 text-[13px] text-ink transition-colors hover:bg-ink/[0.04]"
                        >
                          <item.icon className="h-3.5 w-3.5 text-teal" />
                          {item.label}
                          <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            Go to
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {grouped.groups.filter((g) => g.items.length > 0).length > 0 &&
              grouped.groups
                .filter((g) => g.items.length > 0)
                .map((g) => (
                  <div key={g.key} className="border-b border-ink/8 last:border-0">
                    <div className="sticky top-0 border-b border-dotted border-ink/12 bg-ivory px-4 py-1.5">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-teal-dark">
                        {g.label} · {g.items.length}
                      </span>
                    </div>
                    <ul>
                      {g.items.map((item) => (
                        <li key={`${item.kind}:${item.id}`}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              setOpen(false);
                              pushRecentSearch(query);
                              setRecent(getRecentSearches());
                            }}
                            className="group flex items-baseline gap-3 border-b border-dotted border-ink/10 px-4 py-2.5 transition-colors hover:bg-ink/[0.04]"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-ink/25 font-mono text-[9px] font-bold text-teal">
                              {KIND_GLYPH[item.kind] ?? "·"}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-serif text-[13.5px] font-bold text-ink">
                                {item.title}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[9.5px] text-muted-foreground">
                                <span>{item.context}</span>
                                {item.detail && (
                                  <span className="border border-amber/40 bg-amber/5 px-1 py-0.5 text-amber-dark">
                                    {item.detail}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-ink/35 transition-colors group-hover:text-teal">
                              {item.score}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Subject Switcher — filters every downstream page by the active
 *  subject. Reads the stored study context so the whole UI stays in sync
 *  with Command Center, Curriculum, Library and Search. */
function SubjectSwitcher() {
  const ctx = getStudyContext();
  const [, rerender] = useState(0);
  const subjects = classSubjects(ctx.boardId, ctx.classId);

  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);

  return (
    <div className="border-b border-white/[0.08] px-5 pb-3">
      <div className="marginalia [&::before]:hidden mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
        Subject focus
      </div>
      <div className="flex flex-wrap gap-1.5">
        {/* "All subjects" chip resets the focus */}
        <button
          onClick={() => saveContext({ subjectFocus: null })}
          className={cn(
            "border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 active:scale-[0.97]",
            ctx.subjectFocus === null
              ? "border-teal bg-teal/15 text-teal"
              : "border-white/15 text-white/45 hover:border-white/30 hover:text-white/80"
          )}
        >
          All
        </button>
        {subjects.map((s) => {
          const active = ctx.subjectFocus === s.id;
          return (
            <button
              key={s.id}
              onClick={() =>
                saveContext({
                  boardId: ctx.boardId,
                  classId: ctx.classId,
                  subjectFocus: active ? null : s.id,
                })
              }
              className={cn(
                "border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 active:scale-[0.97]",
                active
                  ? "border-teal bg-teal/15 text-teal"
                  : "border-white/15 text-white/45 hover:border-white/30 hover:text-white/80"
              )}
            >
              {s.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Context indicator — "CBSE · Class 10" — shown under the logo so the
 *  student always knows which board and class the whole platform is
 *  currently speaking to. */
function ContextIndicator() {
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const { boardName, className } = getStudyContext();
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-2.5">
      <span className="flex h-5 w-5 items-center justify-center border border-white/15 font-mono text-[9px] font-bold text-amber">
        ▣
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/70">
        {boardName} · {className}
      </span>
    </div>
  );
}

/** Mobile strip under the top bar — lets Class 8/9 students toggle subject
 *  focus on small screens without opening the sheet. */
function MobileSubjectStrip() {
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();
  const subjects = classSubjects(ctx.boardId, ctx.classId);
  return (
    <div className="border-b border-border bg-ivory px-4 py-2 lg:hidden">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {getStudyContext().boardName} · {getStudyContext().className}
        </span>
        <span className="shrink-0 text-border">│</span>
        <button
          onClick={() => saveContext({ subjectFocus: null })}
          className={cn(
            "shrink-0 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider",
            ctx.subjectFocus === null
              ? "border-teal bg-teal/10 text-teal-dark"
              : "border-ink/15 text-muted-foreground"
          )}
        >
          All
        </button>
        {subjects.map((s) => {
          const active = ctx.subjectFocus === s.id;
          return (
            <button
              key={s.id}
              onClick={() =>
                saveContext({
                  boardId: ctx.boardId,
                  classId: ctx.classId,
                  subjectFocus: active ? null : s.id,
                })
              }
              className={cn(
                "shrink-0 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider",
                active ? "border-teal bg-teal/10 text-teal-dark" : "border-ink/15 text-muted-foreground"
              )}
            >
              {s.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const { profile, dna } = useApp();

  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => {
        const active = location === item.href;
        const soon = comingSoon.has(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              onNavigate?.();
              if (soon) {
                toast(`${item.label} — coming in the next stage`);
              }
            }}
            className={`group flex items-center gap-3 border-l-2 px-4 py-2.5 text-[13px] transition-colors duration-150 ${
              active
                ? "border-teal bg-white/[0.07] text-white"
                : "border-transparent text-white/60 hover:border-white/20 hover:text-white/90"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="tracking-wide">{item.label}</span>
            {soon && (
              <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-white/30">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const { logout, profile, dna } = useApp();
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.08] bg-ink lg:flex">
                <Link href="/dashboard" className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-5">
          <img src={LOGO_URL} alt="COGNIFY" className="h-9 w-9" />
          <div>
            <div className="font-serif text-lg font-bold tracking-[0.12em] text-white">COGNIFY</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-teal">
              Learning Laboratory
            </div>
          </div>
        </Link>
        {/* Class context line — what the whole platform is scoped to */}
        <ContextIndicator />
        <div className="flex-1 overflow-y-auto py-5">
          <SubjectSwitcher />
          <NavLinks />
        </div>

        {/* Search */}
        <SearchBox />

        {/* Profile footer */}
        <div className="border-t border-white/[0.08] px-5 py-4">
          <Link href="/profile" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-white/20 bg-white/[0.05] font-serif text-sm font-bold text-teal">
              {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">{profile.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                {profile.board} · {profile.className}
              </div>
            </div>
          </Link>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              DNA profile <span className="text-teal">{dna.profileStrength}%</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-amber"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <MobileHeader />
      {/* Mobile subject switcher strip — only renders when focused */}
      <MobileSubjectStrip />

      {/* Content */}
      <main className="min-h-screen flex-1 lg:pl-64">{children}</main>
    </div>
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { profile, dna } = useApp();
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-ivory px-4 py-3 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <img src={LOGO_URL} alt="COGNIFY" className="h-8 w-8" />
        <span className="font-serif text-base font-bold tracking-[0.12em] text-ink">COGNIFY</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          DNA {dna.profileStrength}%
        </span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 border-ink/20 bg-transparent">
              <Menu className="h-4 w-4 text-ink" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 bg-ink p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-5">
              <img src={LOGO_URL} alt="COGNIFY" className="h-9 w-9" />
              <div className="font-serif text-lg font-bold tracking-[0.12em] text-white">COGNIFY</div>
            </div>
            <div className="py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.08] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {profile.name}
                </div>
                <button onClick={() => { setOpen(false); }} className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-amber">
                  Close
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <ShellContent>{children}</ShellContent>;
}

/* ---------- Page header used inside app pages ---------- */
export function PageHeader({
  overline,
  title,
  subtitle,
  actions,
}: {
  overline: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rise-in flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 px-5 py-6 sm:px-8 lg:px-10">
      <div className="min-w-0">
        <div className="marginalia">{overline}</div>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
