# Parker Morris: Search that finds interview prep

**Problem.** Members search Resources for interview prep, get "No resources found", and stop coming back, even though the videos exist. Search only matched resource link titles, never the Practice Interview videos. This beats the approval backlog (it hits new signups, not the existing members who left) and dark mode (a few loud users).

**Evidence and size.** Oct 11 to Nov 7, weeks Sun to Sat, from `events.csv`. 76 of 97 searches (78%) returned 0 results. Top misses were "case interview" (12), "product sense" (11), and "behavioral" (8). Of the 41 week one members, 29 were gone by Nov 1 to 7. 24 of those 29 had a zero result search, compared with 4 of the 12 who stayed. Members whose first search failed came back later 10 of 37 times, compared with 14 of 16 after a search that worked. Quote: "We search, we get nothing, we leave." (`interviews/02-owen.md`)

**Spec.** For: members prepping for an interview who search first. Does: search covers the practice interview videos and topics, understands synonyms (case, behavioral, STAR, estimation, tell me about yourself), and replaces the dead end with suggested searches. Not building: AI search, new content, dark mode, approval changes. Success metric: zero result search rate. Guardrail: weekly active members on /resources.

**Shipped.** `src/lib/resourceSearch.ts` plus search results in `ResourcesPage.tsx`. I replayed all 106 searches from `events.csv` through the new search, and none returned zero results (before: 85).
