# Day 10 — Major Product Simplification & UX Overhaul

## Phase 1 — Entry points & navigation target
- [ ] /today and /practice auth guard redirects to / (landing), not /login; landing stays public at root
- [ ] Seed demo account: /demo one-click sign-in (Aarav Mehta, CBSE Class 10) from landing page CTA
- [ ] Public nav: Explore Cognify (scroll), Try Demo, Sign In CTAs; remove Learning DNA nav anchor
- [ ] Sidebar: Today, Curriculum, Practice (new), Teach Cognify, Study Groups
- [ ] Onboarding final step → /today; "Open my Command Center" wording → /today
- [ ] Public footer/logged-in CTA → /today

## Phase 2 — Simple Today home screen
- [ ] Today page: Continue Learning card + 1–2 recommended actions + Teach opportunity + Study Group activity
- [ ] Remove weak/developing topics, DNA analysis, error %, calibration, activity history, streak, timetable, goals from Today
- [ ] Small progress indicators only; one simple graph at most

## Phase 3 — Practice core feature
- [ ] New /practice page: Quick 5-question quiz, topic practice, short test entry
- [ ] Simple quiz UI powered by existing topic question banks (curriculum/questionBank)
- [ ] Human-readable feedback: "Keep practising this concept" / "You're improving" / "Try a slightly harder question"
- [ ] Practice results update Learning DNA silently (dna service kept, not exposed)

## Phase 4 — Teach Cognify hero
- [ ] Step 1: choose topic (suggested ready-to-teach topics)
- [ ] Step 2: learn first — 2–3 curated resources
- [ ] Step 3: teach — written explanation + audio/video recording (MediaRecorder)
- [ ] Step 4: AI analysis — built-in LLM for verdict, or fall back to existing mock analyseTeachBack with human-readable feedback
- [ ] Step 5: peer teaching recommendation → "You are ready to teach this topic" + [Teach a classmate] → community
- [ ] No complicated analytics in feedback

## Phase 5 — Study Groups collaborative
- [ ] Community page: group members, group chat (messages with input), Ask a doubt / Answer a doubt
- [ ] Peer teaching requests: "Aarav needs help with X" + [Teach Aarav]
- [ ] Topics being discussed; scoped by board/class

## Phase 6 — Curriculum Explorer + topic flow
- [ ] Topic page: name + one-line description + action row (WATCH / READ / PRACTICE / QUICK TEST / TEACH COGNIFY)
- [ ] Curated resources (1–2 video, 1 reading, practice, quick test); "More resources" collapsed
- [ ] No long paragraphs; start learning in seconds
- [ ] Remove Resource Library from sidebar (library accessible via quiet footer link only); /library stays for advanced users

## Phase 7 — Intelligence behind the scenes & density removal
- [ ] DNA services kept; Profile page demoted to footer quiet link only, no DNA wall
- [ ] Remove Stretch Goals from main experience (footer Coming Soon)
- [ ] Demote Session/Adaptive/Mistakes/Confidence/Revision/Timetable/Goals/Continue/Library/Saved/Interventions from nav, keep code & direct links
- [ ] Remove remaining long mock paragraphs across pages
- [ ] Mobile header: remove DNA % display

## Phase 8 — Verify, checkpoint, deliver
- [ ] Verify: root = landing, demo flow, Today simple, Curriculum works, topic actions, Practice, Teach (text+record), Study Groups chat + peer teaching, DNA not prominent, library demoted, mock text reduced
- [ ] Checkpoint + deliver
