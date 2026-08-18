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
  CalendarDays,
  Command,
  CreditCard,
  LogOut,
  Menu,
  Settings,
  Users,
  UserSquare2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: Command },
  { href: "/curriculum", label: "Curriculum Explorer", icon: BookOpen },
  { href: "/profile", label: "Learning DNA", icon: Atom },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/goals", label: "Stretch Goals", icon: Zap },
  { href: "/community", label: "Study Groups", icon: Users },
  { href: "/credits", label: "Credits", icon: CreditCard },
];

const comingSoon = new Set(["/timetable", "/goals", "/community", "/credits"]);

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

        <div className="flex-1 overflow-y-auto py-5">
          <NavLinks />
        </div>

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
