# COGNIFY — Task Notes (working state)

## Style review feedback (to apply, one pass, then deliver)
1. Logged-in app routes (/dashboard, /curriculum, /profile) screenshot as logged-out redirect → screenshots show login page. Need to verify app routes via browser with localStorage seeded OR check guards. Auth guard redirects logged-out users to /login — screenshot tool is logged out, so app routes legitimately redirect. FIX: pre-seed localStorage for logged-in state in a demo helper? Better: take screenshots via browser after logging in, OR add a `?demo=1` seed. Simplest: browser-based login via UI, then screenshot.
2. Make app surfaces visibly distinct from marketing (dashboard = field notebook ledger, curriculum = book index, profile = case dossier) — largely done but unverified due to redirect.
3. Every metric/recommendation carries provenance (WHY footnote, confidence) — mostly done.
4. DNA helix-stripe motif on every major page (divider, index marker, sidebar accent).
5. Brief amendments (accepted, appended to ideas.md):
   - Product routes never reuse public auth split identity.
   - DNA helix-stripe appears at least once on every major page.
   - Every product metric/recommendation carries provenance language.

## Asset URLs (use exactly)
- Logo: /manus-storage/cognify-logo-mark_070389eb.png
- Hero lab: /manus-storage/cognify-hero-lab_cf2b19b7.png
- DNA illustration: /manus-storage/cognify-dna-illustration_388571e2.png
- Texture: /manus-storage/cognify-lab-texture_eea6ce6a.png

## Architecture
- Static React 19 + Tailwind 4 + wouter. AppContext (contexts/AppContext.tsx) holds auth/onboarding/profile + localStorage cognify.state.v1.
- Pages: Home, Login, Signup, Onboarding, Dashboard, Curriculum, Profile, ComingSoon (/timetable /goals /community /credits).
- Data: lib/mockData.ts (CBSE/ICSE/UP Board, Class 8–10, 6 subjects, chapters/topics w/ mastery/state/revision), lib/types.ts.
- App shell: ink sidebar AppShell.tsx; PublicLayout.tsx = landing header/footer + useRequireAuth/useRequireOnboarding guards.
- TypeScript passes. Landing page verified good. Auth pages verified good.
- TODO: verify logged-in app routes via browser (sign in via UI), fix onboarding guard redirect issue for logged-in but not-onboarded (works). Apply style review, checkpoint, deliver.

## Checklist from brief (coverage)
- [x] Landing, login/signup, onboarding (Board→Class→Subjects→Goals), shell/nav, dashboard command center (today's path w/ WHY, weak topics, revision due, activity timeline, DNA preview, goals, streak), curriculum explorer (tree + 3 view modes + topic drawer w/ mastery/state/last-studied/revision/next-action/resources), profile/DNA preview, responsive, mock data only, reusable components, design tokens in index.css.

## Dashboard findings (after seeding logged-in + onboarded state)
- Dashboard renders the app shell correctly: ink sidebar, header "Learning Command Center", greeting, today's path with WHY marginalia, weak topics, due-for-revision, activity timeline, DNA preview, streak/goals. Design system works.
- BUG 1: "Streak — undefinedd" → streak value renders `undefined` (streak calculation returns undefined). Find streak logic in Dashboard.tsx.
- BUG 2: "Weekly target — 3h 22m of NaNh 00m target" → weekly minutes target NaN. Fix weekly-target math.
- BUG 3: Current streak card shows "d" (missing number, same streak bug).
- BUG 4: Signup form: name/email not bound? Earlier "Tell us your name first" even though input showed Aarav Mehta — actually the state persisted from previous partial run; the toast appeared because name state was empty. Fine, not a bug (state was seeded earlier but empty before typing). NOTE: signup page had values prefilled by browser autocomplete. No fix needed; but signup showed stale name from earlier session — acceptable.
- Also "DNA profile 72%" badge fine. Mistake profile chart renders (recharts).
- DNA preview cards good. Fix streak/target, then verify curriculum + profile pages, then style review apply + checkpoint.

## Post-fix verification (all good)
Dashboard metrics correct (streak 9d, weekly target 7h 00m). Curriculum explorer renders book-index layout + chapter topic rows + topic dossier drawer with mastery, objectives, WHY recommendation, resources, last-studied/next-revision. Profile/dossier page renders case-file sections I–IV with evidence badges, bar charts, rhythm stats. All three app routes verified in browser with seeded state. Next: mobile check of dashboard + final pre-delivery screenshot pass, checkpoint, deliver.
