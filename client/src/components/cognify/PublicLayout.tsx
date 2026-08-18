/**
 * COGNIFY — Public site layout (landing / login)
 * Warm ivory paper, Deep Ink ink, editorial serif display.
 */
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/components/cognify/Primitives";
import { useApp } from "@/contexts/AppContext";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export function PublicNav() {
  const { auth } = useApp();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/92 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="COGNIFY logo" className="h-9 w-9" />
          <span className="font-serif text-xl font-bold tracking-[0.14em] text-ink">COGNIFY</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-[13px] tracking-wide text-dark-text/70 transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#learning-dna" className="text-[13px] tracking-wide text-dark-text/70 transition-colors hover:text-ink">
            Learning DNA
          </a>
          <a href="#curriculum" className="text-[13px] tracking-wide text-dark-text/70 transition-colors hover:text-ink">
            Curriculum
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {auth.kind === "logged-in" ? (
            <Button asChild className="h-9 bg-ink text-ivory hover:bg-ink/90">
              <Link href="/dashboard">
                Open command center <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="h-9 border-ink/25 bg-transparent text-ink hover:bg-ink/5">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="h-9 bg-teal text-white hover:bg-teal-dark">
                <Link href="/signup">Begin diagnostic <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="container py-12">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="COGNIFY" className="h-9 w-9" />
              <span className="font-serif text-lg font-bold tracking-[0.14em] text-white">COGNIFY</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/50">
              An adaptive learning laboratory. It studies how you learn, then
              shapes every lesson, practice and revision around your Learning DNA.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">Platform</div>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li><a href="#how-it-works" className="hover:text-white">How it works</a></li>
                <li><a href="#learning-dna" className="hover:text-white">Learning DNA</a></li>
                <li><a href="#curriculum" className="hover:text-white">Curriculum</a></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">Study</div>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li><Link href="/signup" className="hover:text-white">Start learning</Link></li>
                <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">Foundation</div>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li><span>CBSE · ICSE · State boards</span></li>
                <li><span>All school subjects</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 font-mono text-[11px] tracking-wider text-white/35">
          © 2026 COGNIFY — The Learning Laboratory. Frontend foundation stage; backend services connecting shortly.
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

// NOTE: route guards live in App.tsx as <GuardedRoute> components.
// Navigation happens inside useEffect, never during render —
// render-phase navigate() breaks wouter's hook-order invariants.
