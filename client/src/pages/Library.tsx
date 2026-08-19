/**
 * COGNIFY — Resource Library
 * The catalogue room: every resource across every studied subject, browsable
 * by subject, resource type and free-web availability. Scholar's Atelier —
 * index tabs along the margin, ledger rows, hairline rules, honest footnote.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { ActionChip, Hairline, Marginalia } from "@/components/cognify/Primitives";
import {
  discoverAll,
  RESOURCE_TYPES,
  topicIndexes,
} from "@/lib/resourceDiscovery";
import type { LearningResource, ResourceFormat } from "@/lib/types";
import { continueLearning } from "@/lib/savedResources";
import { cn } from "@/lib/utils";
import { Clock, ExternalLink, SearchX } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const ALL_FORMATS: { key: ResourceFormat | "all"; label: string }[] = [
  { key: "all", label: "All formats" },
  { key: "lecture", label: "Lecture" },
  { key: "revision", label: "Revision" },
  { key: "explanation", label: "Explanation" },
  { key: "example", label: "Example" },
  { key: "practice", label: "Practice" },
  { key: "diagram", label: "Diagram / visual" },
];

function sourceGlyph(source: LearningResource["source"]): string {
  switch (source) {
    case "youtube":
      return "▶";
    case "ncert":
      return "NC";
    case "cbse":
      return "CB";
    case "edu-website":
      return "W";
    case "cognify-original":
      return "◎";
    default:
      return "?";
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  foundational: "#7fa894",
  core: "#1f9d8b",
  advanced: "#102a43",
  stretch: "#c9862a",
};

export default function Library() {
  const [, navigate] = useLocation();
  const [formatFilter, setFormatFilter] = useState<ResourceFormat | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [freeWebOnly, setFreeWebOnly] = useState(false);

  const resources = discoverAll({
    formats: formatFilter === "all" ? undefined : [formatFilter],
    isFreeWeb: freeWebOnly,
  }).filter((r) => typeFilter === "all" || r.resourceType === typeFilter);

  const indexes = topicIndexes();
  const continuedIds = new Set(continueLearning().map((p) => p.resourceId));

  return (
    <AppShell>
      <PageHeader
        overline="Resource Library"
        title="The catalogue"
        subtitle={`${resources.length} resources across your subjects — indexed by type, format and provenance. A future backend discovery API supplies this shelf.`}
        actions={
          <Link
            href="/dashboard"
            className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            ← Command Center
          </Link>
        }
      />

      {/* Filter strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-5 py-3.5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_FORMATS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFormatFilter(f.key)}
              className={cn(
                "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                formatFilter === f.key
                  ? "border-teal bg-teal text-white"
                  : "border-ink/15 bg-card text-ink/60 hover:border-teal/50 hover:text-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
              typeFilter === "all"
                ? "border-ink bg-ink text-ivory"
                : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
            )}
          >
            All types
          </button>
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={cn(
                "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                typeFilter === t.id
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
        <button
          onClick={() => setFreeWebOnly(!freeWebOnly)}
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
            freeWebOnly
              ? "border-amber bg-amber/10 text-amber-dark"
              : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
          )}
        >
          <ExternalLink className="h-3 w-3" /> Free web sources only
        </button>
      </div>

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Ledger */}
        <section className="min-w-0 flex-1">
          {resources.length > 0 ? (
            <ul className="divide-y divide-ink/8 border-y border-ink/10">
              {resources.map((r, i) => (
                <li key={r.id}>
                  <div className="grid grid-cols-[2.5rem_1fr_auto] gap-4 py-4">
                    <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
                          style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                          title={r.sourceLabel}
                        >
                          {sourceGlyph(r.source)}
                        </span>
                        <span className="font-mono text-[10px] text-ink/55">{r.sourceLabel}</span>
                        <ActionChip action={actionForFormat(r.format)} />
                        <span
                          className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                          style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                        >
                          {r.difficulty}
                        </span>
                        <span className="border border-amber/30 bg-amber/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-dark">
                          {r.resourceType.replace("-", " ")}
                        </span>
                        {r.isFreeWeb && (
                          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-dark-text/50">
                            <ExternalLink className="h-3 w-3" /> free web
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {r.durationMinutes} min
                        </span>
                        {continuedIds.has(r.id) && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-teal">
                            ● in progress
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 font-serif text-[16px] font-bold leading-snug text-ink">
                        {r.title}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {r.topicTitle}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-ink/20" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Relevance {r.relevance}
                        </span>
                      </div>
                      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-dark-text/75">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                          Why recommended —{" "}
                        </span>
                        {r.whyRecommended}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => navigate(`/session/${r.id}?topic=${r.topicId}`)}
                        className="h-9 whitespace-nowrap border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                      >
                        Begin session
                      </button>
                      <button
                        onClick={() => {
                          toast("Saving to your shelf — evidence logged");
                          import("@/lib/savedResources").then((m) => m.addSaved(r));
                        }}
                        className="h-9 whitespace-nowrap border border-ink/25 bg-card px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <Hairline className="-mb-1" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-ink/20 py-14 text-center">
              <SearchX className="h-6 w-6 text-ink/30" />
              <div className="font-serif text-lg font-bold text-ink">
                No resources match these filters
              </div>
              <p className="footnote max-w-md">
                Cognify ranks what exists rather than inventing material — broaden a filter
                to widen the shelf.
              </p>
            </div>
          )}

          <p className="footnote mt-6 max-w-2xl border-l-2 border-teal/40 pl-4">
            The shelf is drawn from NCERT official material, CBSE-aligned public sources,
            free education websites and COGNIFY's own engine. A future resource-discovery
            API replaces this index with live results; provenance labels stay the same.
          </p>
        </section>

        {/* Margin panel */}
        <aside className="w-full shrink-0 space-y-6 lg:w-80">
          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>Index — subjects</Marginalia>
            <ul className="mt-3 space-y-1.5">
              {Array.from(new Set(indexes.map((i) => i.subjectName))).map((name) => {
                const count = indexes.filter((i) => i.subjectName === name).length;
                return (
                  <li key={name} className="flex items-baseline justify-between border-b border-dotted border-ink/15 pb-1">
                    <span className="font-serif text-[14px] text-ink">{name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{count} topics</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>Type legend</Marginalia>
            <ul className="mt-3 space-y-2">
              {RESOURCE_TYPES.map((t, i) => (
                <li key={t.id} className="flex items-center gap-2 text-[12px] text-dark-text/75">
                  <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-wider">{t.label}</span>
                  <span className="ml-auto font-mono text-[9px] text-muted-foreground">{t.id}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-ink/10 bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-teal">Observation</div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              A catalogue is only useful if it is consulted. Finish a started pass before
              opening a fresh resource — the data favours depth over breadth.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function actionForFormat(format: ResourceFormat): string {
  switch (format) {
    case "lecture":
      return "learn";
    case "revision":
      return "revise";
    case "practice":
      return "practice";
    case "explanation":
    case "example":
    case "diagram":
      return "learn";
    default:
      return "learn";
  }
}
