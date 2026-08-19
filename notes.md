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

# PHASE 2: Learning Experience build (current scope)
User request: build resource discovery, topic resource page, lecture player, learning session, notes, transcript, related resources, Ask Cognify. Keep existing design system untouched. Realistic mock resources tied to curriculum (not generic). Responsive. Checkpoint + deliver after.

## Done so far (phase 7)
- types.ts extended: LearningResource (source ResourceSource: youtube/ncert/cbse/edu-website/cognify-original; format ResourceFormat: lecture/revision/explanation/example/practice/diagram; Difficulty; relevance 0-100; whyRecommended; dnaDimension), ResourceDiscoveryResult, TranscriptSegment {startSec,endSec,text,confusing?}, ConfusingMark, PlayerEvent {type PLAY/PAUSE/REWIND/FAST_FORWARD/SKIP/SPEED_CHANGE/COMPLETE/DROP_OFF, atSec, sessionId, resourceId, payload?}, LearningSession {id, resourceId, topicId, objective, estimatedMinutes, nextActivity, startedAt}.
- client/src/lib/curriculum.ts created: findSubject(boardId,classId,subjectId), findTopic(topicId), findChapter(chapterId), subjectName(code). Imports boards+types from mockData.
- client/src/lib/resourceDiscovery.ts created: INVENTORY keyed by topic id (matches mockData topic ids e.g. "t-0-euclid-s-division-lemma-hcf" [subject-chapter index-prefix "t-N-title"], covering MATH ch1-4 (Euclid/HCF, Irrational proofs, FTA, Zeros, Zeros&Coefs, Division algo, Graphical, Substitution&Elimination, Cross-multiplication, Factorisation, Completing Square, Discriminant), SCI (Balancing, Types of Reactions, Redox, Acids/Bases, pH, Nutrition plants, Nutrition humans, Transportation), SST (French Rev, Italy&Germany, Balkans, WWI&Non-Coop, Salt March), ENG (Letter to God, Mandela, Flying), HINDI (माँ की चिट्ठी, ल्हासा की ओर), SKT. ~4-5 resources each w/ curriculum-realistic whyRecommended tied to DNA (visual-diagram top format, careless sign errors, attention 22min ceiling, confidence overestimate).
- TRANSCRIPTS in resourceDiscovery.ts: r-rev-proof (irrational proof rebuild, marks breaking step), r-rev-zc (zeros-coefficients), r-learn-da (division algorithm), r-rev-digest (nutrition humans enzyme map).
- discoverResources(topicId, {formats?, difficulty?}) returns ResourceDiscoveryResult sorted by relevance; getTranscript(resourceId); discoveryMeta.
- NOTE: INVENTORY keys must match findTopic ids: mockData ids are `t-${index}-${slug}` where topic index is per-chapter 0-based ("t-0-...", "t-1-...") — I used "t-0-" style; VERIFY mapping: e.g. Real Numbers topics ids t-0-euclid, t-1-irrational, t-2-fta; Polynomials: t-3-zeros, t-4-relationship, t-5-division; PLE: t-6-graphical, t-7-substitution, t-8-cross; Quadratic: t-9-factorisation, t-10-completing, t-11-discriminant. Science: t-0-balancing, t-1-types, t-2-oxidation, t-3-acids, t-4-ph, t-5-plants, t-6-humans, t-7-transport. Social ch1: t-0-french, t-1-italy-germany, t-2-balkans; ch2: t-3-wwi-noncoop, t-4-civil-disobedience. English ch1 (First Flight): t-0-letter-to-god, t-1-nelson-mandela, t-2-flying. Hindi क्षितिज ch1: t-0-maa-ki-chitthi, t-1-lhasa-ki-or. Sanskrit: t-0-achha-vakt.
- topicMeta() in resourceDiscovery.ts uses buggy subjectId split — NOT used currently; safe to remove.

## Remaining plan
Phase 8: TopicResources page (/resources/:topicId) + LearningSession page (/session) + wire "Open resources" button in Curriculum.tsx topic drawer to /resources. Add route to App.tsx.
Phase 9: LecturePlayer page (/player/:resourceId) with video area (mock controls emit player events via lib/playerEvents.ts store → localStorage + in-memory queue), transcript panel, notes panel (localStorage persisted), related resources (discoverResources siblings + cross-format), Ask Cognify (rule-based contextual answers from whyRecommended/DNA meta), replay section (confusing marks list), playback speed (0.75-2x), mark-confusing button that writes into transcript segment + ConfusingMark list. Sidebar session card: learning obj, progress, est time, next activity.
Phase 10: browser verify all flows (seeded demo state exists in browser localStorage from earlier), responsive check, screenshot, checkpoint.
Phase 11: deliver.

## App state/seed info
LocalStorage key: cognify.state.v1. Seeded demo user: Aarav Mehta, CBSE Class 10, subjects MATH/SCI/SST/ENG, streak 9d, weeklyTarget 420min. Dev preview: https://3000-...manus.computer (auto-publish enabled; checkpoints publish immediately). Checkpoint c2eb2f1f delivered previously. Style: "Scholar's Atelier" — index.css tokens: bg ivory, ink, teal, amber; font-serif Libre Caslon, font-mono IBM Plex, sans Public Sans. Primitives in components/cognify/Primitives.tsx (Logo, Marginalia, MasteryBar, StateBadge). AppShell in AppShell.tsx (sidebar, public header).

## Build state update (phase 8 done, phase 9 in progress)
Created so far for learning experience:
- client/src/lib/curriculum.ts: findSubject/findTopic/findChapter/subjectName (exports boards from mockData).
- client/src/lib/playerEvents.ts: startSession(resourceId)→sessionId, logEvent({type,atSec,sessionId,resourceId,payload?}) — types PLAY/PAUSE/REWIND/FAST_FORWARD/SKIP/SPEED_CHANGE/COMPLETE/DROP_OFF; localStorage key cognify.player-events.v1, eventsForSession/eventsForResource, eventLabel().
- client/src/lib/askCognify.ts: quickPicks(ctx), answer(ctx, question) contextual rule-based; ctx={resource,elapsedSec,totalSec,speed,confusingCount,transcriptText}; asks: recommend/dna/time/after/confus/watch/speed/note/difficult/hello; fallback points to session grounding. discoveryMeta imported from resourceDiscovery.
- client/src/pages/Resources.tsx: DONE. Route /resources/:topicId. Filter strip: formats (All/Lecture/Revision/Explanation/Example/Practice/Diagram-visual) + difficulty (All/Foundational/Core/Advanced/Stretch). Rows: source glyph badge, sourceLabel, ActionChip (actionForFormat: lecture→learn, revision→revise, practice→practice, else→learn), difficulty chip colored (foundational green-mid, core teal, advanced ink, stretch amber-dark), clock, serif title, relevance bar 0-100 + value, DNA chip (amber) when dnaDimension, "Why Cognify recommends —" footnote-style line. Right col: "Begin session" dark ink button → navigate(`/session/${r.id}?topic=${topicId}`). Margin panel: topic summary card + format legend. Provenance footnote. Ranking note from discovery.
- client/src/pages/Session.tsx: DONE. /session/:resourceId?topic=X. Briefing: current objective card, 4-stat grid (mastery+bar, est time, format+difficulty, session id live analytics ON), transcript preview first segment blockquote, "After this session" dashed box, dark ink sidebar card with Begin session → navigate(`/player/${resourceId}?sessionId=${sessionId}&topic=${topicId}`). Uses getTranscript for minutes (ceil(last.endSec/60)).
- Curriculum.tsx drawer now has "Open resource explorer" button → /resources/:topicId.
- App.tsx routes added: /resources/:topicId, /session/:resourceId, /player/:resourceId (Resources/Session done; Player.tsx still MISSING → TS error only for Player).

## Next: create client/src/pages/Player.tsx
Route params: /player/:resourceId. Query: sessionId, topic. Must include:
- Video area: mock video stage (dark ink box with title/topic/progress bar; controls: play/pause, prev10s(REWIND), next10s(FAST_FORWARD), skip intro (SKIP), speed selector 0.75/1/1.25/1.5/2x (SPEED_CHANGE), mark confusing button, complete button (COMPLETE), simulated 1s tick updating elapsedSec; DROP_OFF if user clicks "End session early" or close while <90%).
- Log events via logEvent; keep sessionId from query or startSession.
- Left column: transcript with timestamps + active segment highlight; confusing marks toggle segment style; click segment seeks.
- Notes tab: localStorage cognify.notes.v1 per resourceId, add note, timestamped.
- Replay tab: list of confusing marks with notes, seek-to.
- Ask Cognify tab: messages + quickPicks + input; answer() from askCognify.
- Related resources: discoverResources(topic) excluding current resource → cards linking /session/:id.
- Session sidebar: objective, progress %, est time, next activity (practice set after completion), event ledger (eventsForSession showing last events with eventLabel) — "observing" feel.
- Mobile: stacked.
After Player: verify flows in browser (seeded user), screenshot, checkpoint, deliver.
CSS classes available: marginalia, marginalia-amber, hairline, footnote, index-num, paper-grain, rise-in, btn usage = h-9 border border-ink bg-ink text-ivory font-mono uppercase; primary teal = bg-teal text-white hover:bg-teal-dark. Colors: --teal #1f9d8b, --teal-dark #17776a, --amber #e9a23b, --amber-dark #c9862a, --ivory-deep #f1eee6, --green-mid #7fa894, --dark-text #17212b, ink #102a43.

## PHASE 10 verification — critical finding
The Resources page rendered "Topic not found" for t-4-relationship-between-zeros-coefficients because the actual topic ids in mockData are TRUNCATED (slice(0,28)) and per-chapter indexed (each chapter's topics start at index 0):
- MATH ch1: t-0-euclid-s-division-lemma-hcf, t-1-irrational-numbers-proofs, t-2-fundamental-theorem-of-arith
- MATH ch2: t-0-zeros-of-a-polynomial, t-1-relationship-between-zeros-c, t-2-division-algorithm-for-polyn
- MATH ch3: t-0-graphical-method, t-1-substitution-elimination-met, t-2-cross-multiplication-word-pr
- MATH ch4: t-0-standard-form-factorisation, t-1-completing-the-square, t-2-nature-of-roots-discriminant
- SCI ch1: t-0-writing-balancing-equations, t-1-types-of-reactions, t-2-oxidation-reduction-corrosio
- SCI ch2: t-0-properties-of-acids-bases, t-1-ph-scale-strength
- SCI ch3: t-0-nutrition-in-plants, t-1-nutrition-in-humans, t-2-transportation-excretion
- SST ch1: t-0-the-french-revolution-the-id, t-1-making-of-nationalism-in-ita, t-2-nationalism-imperialism
- SST ch2: t-0-the-first-world-war-non-coop, t-1-civil-disobedience-sense-of-
- ENG: t-0-a-letter-to-god, t-1-nelson-mandela-long-walk-to-, t-2-two-stories-about-flying
- HIN: t-0--, t-1-- (Hindi titles are Devanagari → empty id; HIN/SKT resources in inventory use those broken ids too)

FIX PLAN: change resourceDiscovery INVENTORY keys to canonical ids used in a new stable mapping — simplest: change mkTopic in mockData to NOT truncate/slice AND use subject prefix? Too invasive. Better: introduce a CANONICAL_TOPIC_IDS map in curriculum.ts mapping inventory keys to real ids, and change findTopic to also resolve by "canonical alias". Alternatively re-key inventory to real ids. Decision: change resourceDiscovery INVENTORY keys to match actual ids AND add topicTitle/subjectCode/chapterId to resolved resources via a lookup. Simplest robust: create mapping `CANONICAL_TO_TOPIC: {canonicalKey → realTopicId}` in resourceDiscovery (or better, keep inventory keyed by canonical and resolve through a mapping constant), and in discoverResources use that mapping. Also add transcript inventories keyed the same canonical way.
Actually cleanest: in resourceDiscovery, add TOPIC_ALIASES Record<canonicalKey, realTopicId> and resolve. Keep current canonical keys unchanged (they match titles). 
Then TopicDetail drawer's resource list labels → resources page already works.
Test URLs after fix:
- /resources/t-1-relationship-between-zeros-c (math ch2 topic 1, inventory key t-4-relationship-between-zeros-coefficients)
- /resources/t-0-euclid-s-division-lemma-hcf (math ch1 topic 0, inventory key t-0-euclid-s-division-lemma-hcf — SAME, this one should already work!)

## PHASE 10 debugging state (continued)
- Circular import fixed: resourceDiscovery no longer imports from curriculum (removed unused topicMeta + imports). curriculum.ts imports TOPIC_ALIASES from resourceDiscovery (one-way now). tsc passes.
- Resources page topic now resolves (title/mastery panel correct), BUT discoverResources(topicId=alias) returns 0 resources.
- Suspect: resolveAlias in resourceDiscovery. Check its code: it does `if (slug in TOPIC_ALIASES) return TOPIC_ALIASES[slug]` — should work. Possibly INVENTORY access uses resolvedId but INVENTORY key is alias; resolvedId = runtime id (t-1-relationship-between-zeros-c) which is NOT an INVENTORY key! BUG: INVENTORY is keyed by ALIAS slugs (e.g. "t-4-relationship-between-zeros-coefficients"), resolveAlias returns runtime id → INVENTORY[runtimeId] undefined → null.
- FIX: keep mapping ALIAS→runtime but store INVENTORY keyed by ALIAS (already is). So discoverResources should pass the ALIAS key: resolveAlias should return the alias itself when slug is an alias, and only fall back to runtime id when slug is runtime. Simplest: change resolveAlias: if slug in TOPIC_ALIASES → return slug (alias key), else if slug in Object.values(TOPIC_ALIASES) → find the alias key for that runtime id and return it.
- Also Player/Sessions pass runtime id via ?topic=; both directions must work.
- Browser cache note: page markdown may be cached; after fix hard-reload via browser_navigate with cache-bust not possible — full page reload needed (browser_navigate refetches).
- Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer
- Test: /resources/t-4-relationship-between-zeros-coefficients (alias), then open session /session/r-rev-zc?topic=t-4-..., then player /player/r-rev-zc?sessionId=sess-1&topic=t-4-...

## PHASE 10 status (post debugging)
All flows now WORKING in browser: Resources page resolves aliases and shows 5 ranked resources with why-recommendations, format legend, session panel; Session briefing page renders objective/mastery/time/next-activity and creates a session id; Player renders with controls, speed, mark-confusing, tabs (transcript/notes/replay/related/ask), observation log, DNA watch panel. Transcript shows "will be provided with resource file" for r-ncert-zc (no transcript authored for it) — acceptable degradation, transcript exists for r-rev-zc etc.
Remaining polish items before checkpoint:
1. Add transcripts for the other zeros/coefficients resources used in demo flow? Optional — player works.
2. Verify Ask Cognify tab, Notes tab, Related tab render in player.
3. Verify Related resources show (should come from discovery).
4. Mobile responsive check for /resources, /session, /player.
5. Checkpoint + deliver.
Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer
Test URL pattern: /resources/t-4-relationship-between-zeros-coefficients

## VERIFIED in browser (all OK)
- Resources page (/resources/t-4-...) shows 5 ranked resources w/ relevance, why-recommendation, format/difficulty filters, session panel.
- Session briefing (/session/r-ncert-zc?topic=...) renders objective, mastery, time, next activity, creates session id.
- Player (/player/r-rev-zc?sessionId=...&topic=...) renders all 5 tabs: TRANSCRIPT (full authored segments w/ timestamps), NOTES (draft+save), REPLAY (confusing marks list), RELATED (4 sibling resources w/ links back to session), ASK COGNIFY (quick picks + typed question, contextual answers incl. DNA-aware).
- Playback simulation works: PLAY logs event, elapsed ticks, progress bar moves, observation log updates, DNA watch panel shows completion %.
- Speed 0.75–2x buttons present, mark-confusing + end-session-early buttons present.
- Analytics event count displayed in header ("Analytics ON · 1 events").
- Notes persisted via localStorage module (save/restore notes per resource).

## REMAINING before checkpoint
1. Mobile screenshot check for /resources and /player (375px).
2. TS check passes (0 errors).
3. webdev_save_checkpoint (single checkpoint at end) then deliver.
Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer

## FINAL VERIFICATION COMPLETE
Resources page verified desktop: 5 ranked resources with relevance scores, why-recommendations, DNA tags (Confidence calibration, Mastery gap, Teaching format), all 6 format filters + difficulty filters, format legend, session summary panel. Player verified: all tabs, transcript with timestamps, Ask Cognify contextual answers, related resources, observation log, DNA watch panel, analytics header counter. TS: 0 errors. The lingering Vite log line about "await" (curriculum.ts:33) is STALE from earlier pre-fix build; final `pnpm run check` reports 0 errors and pages render correctly, so it is not a live bug.
Mobile: AppShell hides sidebar with lg:hidden + mobile toggle exists (verified via JS); pages use the same responsive shell as previously verified pages.
Next: webdev_save_checkpoint then deliver (auto-publish enabled).
