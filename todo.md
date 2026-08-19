# Day 2 — Resource Library + Learning Experience (frontend-only)

## Service/data layer
- [ ] Extend resource types: 10 resource types (video lecture, article, ncert/textbook, diagram, animation/visual, revision notes, solved example, practice set, quick revision, concept explanation) with per-type layouts
- [ ] Expand mock inventory: more resources per topic + more topics/subjects (keep all 5 subjects rich)
- [ ] Saved resources service (localStorage, cognify.saved-resources.v1) + bookmark service
- [ ] Search service (topics/resources/lectures/notes/practice) across inventory
- [ ] Recommendation rails service ("Recommended for you", "Because you struggled", "Best for quick revision", "Best for conceptual understanding", "Continue learning", "Before your upcoming test", "Explore another explanation") — all with WHY provenance, DNA-driven
- [ ] Continue-learning service (partial progress per resource, unfinished sessions, due revision)
- [ ] Interaction tracking service expanded (seek, mark confusing, ask, note, save, switch, retry) — playerEvents.ts

## Pages
- [ ] Resource Library hub (/library) — major nav section, board→class→subject→chapter→topic selector, reach from command center/curriculum/topics/recommendations
- [ ] Free web resources section on library page ("Free resources from across the web") with source badges (YouTube, NCERT, CBSE, edu websites, OER) + per-resource save/open buttons
- [ ] My Saved Resources (/saved) — filters by subject/type/chapter/recent
- [ ] Continue Learning page/section (/continue) — partially watched, unfinished sessions/practice, saved, upcoming revision
- [ ] Topic Learning page (/topic/:id) — overview, learning objectives, mastery, last studied, revision due, recommended format + why, recommended resources, practice entry, revision status, related topics, DNA insight
- [ ] Integrated search (cmdk palette, globally reachable) — Cognify-styled

## Player/session enhancements
- [ ] Resource comparison / alternative explanations inside player ("Didn't click? Try: VIDEO → DIAGRAM → EXAMPLE → SIMPLE EXPLANATION → QUICK REVISION")
- [ ] Learning objective card in player ("what you should understand by the end")
- [ ] Timestamped notes linked to timeline (02:14 marker, highlight/mark confusing on notes)
- [ ] Ask Cognify action buttons: Explain differently, Give me an example, Give me a hint, Test me on this, Show me a diagram, Why is this important, Find another explanation, Make me teach this back (mock responses)
- [ ] Save resource button in player
- [ ] Previous/next resource navigation in player
- [ ] Session mode reflection actions (I am confused / I understand / Ask Cognify / Take notes / progress)

## Navigation/wiring
- [ ] Add "Resource Library" to sidebar nav + ComingSoon pages (timetable/goals/community/credits) get "SOON" treatment only; library is real
- [ ] Command Center wires: recommended-resources rail / continue-learning entry
- [ ] Curriculum Explorer → topic learning page entry
- [ ] Responsive: desktop/tablet/mobile for new pages (nav collapse already present)

## Verification
- [ ] TS check clean, browser flow test (landing→onboard→CC→curriculum→topic→resources→player→notes→ask→saved→library→search)
- [ ] Checkpoint + deliver

# Day 4 — Adaptive Learning Ecosystem (frontend-only)

## Services (phase 17)
- [ ] Types: Mistake, ConfidenceReading, RevisionEntry, TeachBackSession, Intervention, TimetableSession, StretchGoal, StudyGroup, PeerRequest, AdaptiveRecommendation, ContextAssistantMessage
- [ ] mistakes.ts mock service (categories, per-mistake detail, trends)
- [ ] confidence.ts (calibration readings + opposite case, DNA link)
- [ ] revision.ts (spaced schedule: due today/tomorrow/upcoming/mastered, retention estimate)
- [ ] teachBack.ts (topics, prompts, key-points checklists, mock analysis results)
- [ ] interventions.ts (active interventions with evidence strength)
- [ ] timetable.ts (today/week/upcoming with mark complete / skip / reschedule / start)
- [ ] goals.ts (stretch goals with progress, deadline, why, actions)
- [ ] studyGroups.ts (group, discussions, questions, teach requests, peer finder)
- [ ] adaptive.ts (today's adaptive path: recommendation + WHY, priority, format)
- [ ] assistant.ts (contextual AI panel with context state + realistic mock conversations)

## Pages (phases 18-22)
- [ ] Adaptive Learning hub (/adaptive) — today's adaptive path + learning path viz
- [ ] Mistake Analysis (/mistakes) + mistake detail
- [ ] Confidence Calibration (/confidence)
- [ ] Revision hub (/revision) + revision session (/revision/:topic)
- [ ] Timetable (/timetable) — full experience
- [ ] Stretch Goals (/goals) — full experience
- [ ] Teach Cognify (/teach) + teach-back flow + teach requests
- [ ] Study Groups (/community) — full experience
- [ ] Interventions (/interventions)
- [ ] Command Center: Today's adaptive path, revision due, DNA insight, active goal, continue, teach-back challenge, study group activity (progressive disclosure)

## Cross-cutting
- [ ] Sidebar nav update (remove SOON, add Adaptive, Mistakes, Confidence, Revision, Interventions)
- [ ] Learning DNA link indicators ("Added to Learning DNA", evidence strength)
- [ ] Mock conversations in assistant panel; voice recording UI placeholder
- [ ] Responsive checks all pages
- [ ] TS clean, checkpoint, deliver

# Day 5 — Knowledge Engine + Real Learning Experience

## Service layer (client/src/lib/)
- [ ] Enrich LearningResource metadata (class label, chapter title, per-resource learning objective, free-web flag wiring)
- [ ] curriculumEngine.ts — curriculum map resolution (class subjects w/ mastery aggregates, chapter overview stats, topic breadcrumb)
- [ ] discoverySearch.ts — global knowledge-engine search w/ grouped results (TOPICS, RESOURCES, REVISION, PRACTICE, PATHS), filter+sort engine over resources
- [ ] learningSessionFlow.ts — session flow (watch → 5-question retrieval → practice → confidence rating → DNA update), localStorage persisted
- [ ] topicSequence.ts — 7-stage learn-this-topic sequence generator w/ realistic CBSE content per stage

## Pages
- [ ] Upgrade Library.tsx → Resource Discovery (/library): filters (subject, class, resource type, duration, difficulty, free-only), sorting (most relevant / recommended for me / shortest / recently added / highest evidence), evidence WHY cards
- [ ] Upgrade Session.tsx → video learning page: learning context rail, MARK AS WATCHED / START QUICK CHECK / SAVE / ADD TO LEARNING PATH, "After this resource" rail (retrieval, practice, similar, weak topics)
- [ ] Upgrade TopicLearning.tsx → 7-stage Learn This Topic (CONCEPT → VISUAL EXPLANATION → WORKED EXAMPLE → VIDEO → RETRIEVAL → PRACTICE → TEACH-BACK)
- [ ] New SubjectPage.tsx (/subject/:subjectId) — subject overview + chapter ledger w/ mastery/priority/next revision
- [ ] Upgrade Curriculum.tsx — subject parity + subject links + overview stats
- [ ] Global search overlay in AppShell — grouped knowledge-engine results

## Wiring & QA
- [ ] Nav link updates; sidebar intact
- [ ] TypeScript clean; all routes verified; responsive check (desktop/tablet/mobile)
- [ ] Checkpoint + delivery

# Day 6 — One Coherent Adaptive Platform

## 2. Shared layer
- [ ] WhyInteraction component (WHY? marginalia/footnote pattern) + whyService mock ("why this topic / video / practice / now")
- [ ] JourneyLink primitive (OPEN TOPIC →, CONTINUE SESSION →, PRACTICE THIS →, SEE WHY →, VIEW LEARNING DNA →, WHAT NEXT? →)
- [ ] Recent-searches persistence (localStorage key cognify.searches.v1)
- [ ] Verify data contract interfaces cover StudentProfile/Subject/Chapter/Topic/Resource/LearningSession/PracticeResult/MistakePattern/ConfidenceReading/LearningDNA/Recommendation/RevisionItem/SavedResource (types.ts)

## 3. Command Center
- [ ] TODAY → NEXT numbered sequence (REVISE/PRACTICE/TEACH BACK with durations) + AFTER TODAY "next recommended step"

## 4. Search
- [ ] Groups: subjects, chapters, topics, video lectures, articles, NCERT, revision notes, practice sets, diagrams, saved resources
- [ ] Recent searches section, empty state, no-results state, subject/type metadata

## 5. Continue Learning
- [ ] States: CONTINUE (% watched), RESUME (unfinished), DUE (revision), RETRY (accuracy dropped), SAVED (bookmarked)
- [ ] One clear action per item; mock session-progress storage

## 6. Learning DNA
- [ ] Four questions: How do I learn best / Where am I weak / How confident am I / What should Cognify change
- [ ] Evidence labels (EVIDENCE xx% / BASED ON N SESSIONS), "current signal / early evidence / pattern emerging" language
- [ ] Profile snapshot: board, class, subjects, DNA, streak, top strength, current focus

## 7. Resource evidence framing
- [ ] Library rows: Understand → Cognify is watching → After this
- [ ] Session page: same three-part framing
- [ ] WHY? interactions on topic cards / revision chips

## 8. Empty/loading/error states
- [ ] No saved resources, no mistakes yet, not enough evidence, no revision due, search nothing, backend unavailable
- [ ] Subject coverage in selectors (Eng/Hin/Skt realistic)

## 9. Polish + journey pass
- [ ] 200–250ms transitions, underline hovers, reduced-motion
- [ ] Full journey: Landing → Onboarding → Dashboard → Curriculum → Subject → Topic → Library → Session/Player → Practice/Teach → DNA → Adaptive → Dashboard
- [ ] Fix broken nav/dead buttons/duplicated UI
- [ ] Checkpoint + deliver

# Day 7 — UX Refinement, Personalization & Simplification

Constraints: NO redesign, NO new major features, NO removal of features. Preserve Scholar's Atelier identity.
Judge demo path: Command Center → Class 10 Social Science → Nationalism in India → Cognify recommends resource → Learning session → practice → weakness → DNA → changed recommendation. 2-3 min, max ~6 screens.

## Phase 2 — Data layer
- [ ] mockData: genuine Class 8 / Class 9 / Class 10 curriculum differences (real chapters/topics per class, not relabelled)
- [ ] studentProfile = {board, classLevel, subjects} stored (cognify.profile.v1) + onboarding stores classLevel
- [ ] context.ts service: currentClass(), currentSubject(), scopedContent APIs
- [ ] Services scope content by classLevel/subject (resourceDiscovery, revision, mistakes, timetable, goals, journeyData, adaptive)

## Phase 3 — Context surface
- [ ] AppShell: "CBSE · Class 10" context indicator (non-dominant)
- [ ] Subject switcher (pills, per page where subject matters)
- [ ] Class switcher from Profile settings
- [ ] Links/sessions scoped by current class

## Phase 4 — Command Center simplification
- [ ] One primary action: START TODAY'S SESSION
- [ ] Today 01-03 sequence (Learn/Practice/Reflect) + NEXT block
- [ ] One insight only + SEE WHY
- [ ] Continue compact (≤3 items, single action each)
- [ ] One revision item + REVISE
- [ ] DNA snapshot ≤4 stats; move rest behind See analysis
- [ ] Remove metric clutter

## Phase 5 — Progressive disclosure + human language
- [ ] Profile: 4 plain questions + EXPLORE YOUR LEARNING DNA
- [ ] Adaptive Lab: focus + why + plan; SEE EVIDENCE for metrics
- [ ] Mistakes/Confidence/Revision: human labels + human empty states
- [ ] Timetable/Goals/Teach/Community: primary action emphasis

## Phase 6 — Class/subject scoped pages
- [ ] Library filters scoped to current class+subject
- [ ] Search respects classLevel + subject
- [ ] Continue scoped, human verbs (CONTINUE/RETRY/REVISE/FINISH)
- [ ] Topic page: one topic focus, one strong resource, START LEARNING
- [ ] Curriculum subject parity + class-aware chapters
- [ ] Resource rows: what/learn/why + one action

## Phase 7 — Readability
- [ ] Contrast audit (gray/teal/amber text → readable ink)
- [ ] Typography hierarchy: heading → sentence → action; fewer tiny labels
- [ ] Card reduction (whitespace/dividers/lists)
- [ ] Human empty states everywhere
- [ ] Responsive pass (sidebar, filters, titles, mobile primary action)

## Phase 8 — Verification
- [ ] 3 class profiles (8/9/10): content differs genuinely
- [ ] Class 10 × 5 subjects: only subject content visible
- [ ] Judge demo path end to end
- [ ] Checkpoint + deliver
