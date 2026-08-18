/**
 * COGNIFY — Student profile / Learning DNA analysis (preview page)
 * Case-study aesthetic: dimensions as numbered dossier sections, evidence
 * strength stated for every claim, format-experiment results as a ledger chart.
 * Full analytics deferred to a later stage — this is the DNA preview.
 */
import { Button } from "@/components/ui/button";
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Hairline, Marginalia, MasteryBar } from "@/components/cognify/Primitives";
import { useApp } from "@/contexts/AppContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";
import { toast } from "sonner";

const formatLabels: Record<string, string> = {
  "visual-diagram": "Visual diagrams",
  "worked-example": "Worked examples",
  analogy: "Analogy",
  "step-by-step": "Step-by-step",
  "verbal-explanation": "Verbal explanation",
};

export default function Profile() {
  const { profile, dna, goalsList, credits } = useApp();

  return (
    <AppShell>
      <PageHeader
        overline="Student Profile — Learning DNA"
        title={`The case file of ${profile.name}`}
        subtitle="Full analytics are being built for the next stage. This dossier shows what COGNIFY has established so far — every claim carries its evidence strength."
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Dossier header */}
        <div className="rise-in grid gap-6 border-b border-ink/10 pb-7 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-ink/20 bg-card font-serif text-xl font-bold text-teal">
              {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink">{profile.name}</h2>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {profile.board} · {profile.className} · File opened {formatDate(profile.createdAt)}
              </div>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-dark-text/75">
                Stated goal: <em className="font-serif">{profile.learningGoal}</em>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10 lg:col-span-1">
            {[
              ["DNA complete", `${dna.profileStrength}%`],
              ["Streak", `${profile.streakDays} days`],
              ["Credits", `${credits.balance}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-card p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{k}</div>
                <div className="mt-1 font-serif text-xl font-bold text-ink">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-9 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Left: dimensions dossier */}
          <div className="min-w-0 space-y-9">
            <section>
              <Marginalia amber>Section I — Established insights</Marginalia>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {dna.insights.map((ins, i) => (
                  <div key={ins.id} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr]">
                    <span className="font-serif text-xl italic text-teal">
                      {["I", "II", "III", "IV"][i]}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink/60">
                          {ins.dimension}
                        </span>
                        <span className="border border-teal/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-teal-dark">
                          evidence {ins.confidence}%
                        </span>
                      </div>
                      <p className="mt-2 font-serif text-lg font-bold leading-snug text-ink">{ins.finding}</p>
                      <p className="mt-2 footnote">{ins.implication}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Marginalia>Section II — Mistake classification</Marginalia>
              <p className="mt-3 max-w-xl footnote">
                {dna.mistakeProfile.conceptual}% of your errors are conceptual, {dna.mistakeProfile.careless}%
                careless, {dna.mistakeProfile.procedural}% procedural. Each class demands
                a different intervention — this is why COGNIFY never treats all
                mistakes as equal.
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  ["Conceptual", dna.mistakeProfile.conceptual, "#1f9d8b"],
                  ["Careless", dna.mistakeProfile.careless, "#e9a23b"],
                  ["Procedural", dna.mistakeProfile.procedural, "#102a43"],
                ].map(([label, value, color]) => (
                  <div key={label as string} className="flex-1 border border-ink/10 bg-card p-4">
                    <div className="h-1.5 w-full bg-ivory-deep">
                      <div className="h-full" style={{ width: `${value}%`, background: color as string }} />
                    </div>
                    <div className="mt-3 font-serif text-xl font-bold text-ink">{value}%</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right rail */}
          <div className="space-y-9">
            <section className="border border-ink/12 bg-card p-5">
              <div className="marginalia [&::before]:hidden">Section III — Teaching-format experiments</div>
              <p className="mt-2 footnote">
                COGNIFY rotates formats and measures what actually works for you.
                Success = retention & performance gain per format.
              </p>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dna.formatExperimentResults.map((f) => ({
                      name: formatLabels[f.format] ?? f.format,
                      success: f.success,
                    }))}
                    layout="vertical"
                    margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="rgba(16,42,67,0.1)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 10, fontFamily: "Public Sans" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(16,42,67,0.04)" }}
                      contentStyle={{ background: "#F7F5EF", border: "1px solid rgba(16,42,67,0.15)", borderRadius: 2, fontSize: 12 }}
                      formatter={(v) => [`${v}% success`, ""]}
                    />
                    <Bar dataKey="success" fill="#1f9d8b" radius={[0, 2, 2, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 border-t border-ink/10 pt-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Best-performing format</span>
                <span className="ml-2 font-mono text-[11px] font-medium text-teal-dark">
                  {formatLabels[dna.topFormat]} — {dna.formatExperimentResults[0]?.success}% success
                </span>
              </div>
            </section>

            <section className="border border-ink/12 bg-card p-5">
              <div className="marginalia [&::before]:hidden">Section IV — Rhythm</div>
              <dl className="mt-3 space-y-3">
                <div className="flex items-baseline justify-between border-b border-ink/8 pb-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Peak focus hour</dt>
                  <dd className="font-mono text-[12px] font-medium text-ink">{dna.peakFocusHour}</dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-ink/8 pb-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Avg session</dt>
                  <dd className="font-mono text-[12px] font-medium text-ink">{dna.avgSessionMinutes} min</dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-ink/8 pb-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Weekly target</dt>
                  <dd className="font-mono text-[12px] font-medium text-ink">{Math.round(profile.weeklyTargetMinutes / 60)}h 00m</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Profile strength</dt>
                  <dd className="font-mono text-[12px] font-medium text-teal-dark">{dna.profileStrength}%</dd>
                </div>
              </dl>
              <MasteryBar value={dna.profileStrength} className="mt-3" />
              <p className="mt-3 footnote">
                More study sessions = a sharper DNA. {100 - dna.profileStrength}% of the profile
                is still being written.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-teal" />
                <Marginalia className="[&::before]:hidden">Goals on file</Marginalia>
              </div>
              <ul className="mt-3 space-y-3">
                {goalsList.map((g) => (
                  <li key={g.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-serif text-[14px] font-bold text-ink">{g.title}</span>
                      <span className="font-mono text-[11px] text-teal-dark">{g.progress}%</span>
                    </div>
                    <MasteryBar value={g.progress} className="mt-1.5" />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <Hairline className="my-8" />
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <p className="footnote max-w-xl">
            Note: confidence scoring, attention analysis and resilience modelling run on
            the backend. This dossier renders what the Learning DNA service returns today.
          </p>
          <Button
            variant="outline"
            className="h-10 border-ink/25 bg-transparent text-ink hover:bg-ink/5"
            onClick={() => toast("Full analytics suite — analytics page — arrives in the next stage")}
          >
            Analytics page · coming soon
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
