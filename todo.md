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
