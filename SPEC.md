# Make interview prep findable in Resources

**Problem.** Members search Resources for interview prep, get "No resources found", and leave, even though PMA already has the videos and guides. Search only checked the 16 resource links. It never checked the 55 practice videos, the 8 topic guides, or the APM Playbook.

**Evidence** (from the case kit; method in parentheses)
- Weekly active members fell 41 → 33 → 30 → 23 (distinct members viewing unlocked `/resources`, Sun to Sat, `events.csv`).
- 24 of the 29 members who left had a zero-result search, against 4 of the 12 who stayed (`events.csv`, Oct 11 to Nov 7).
- 76 of 97 searches (78%) returned nothing. The top misses were "case interview", "product sense" and "behavioral".
- In session data, 22 of the 23 member visits that hit "No resources found" ended there (`clicks.csv`, Oct 27 to Nov 9).
- "We search, we get nothing, we leave." (Owen, `interviews/02-owen.md`)
- These numbers show where visits stalled, not how much of the drop search caused on its own.

**What ships**
1. **Recommended starting point.** Common interview searches show one short video first: "case interview" → 5 min rubric, "product sense" → 25 min Headspace mock, "behavioral" → 3 min story bank.
2. **Whole-library search,** grouped as Interview guides, Videos, APM Playbook, and Resources.
3. **Open guide / Open step** jump to the right tab. When nothing matches, **Browse Practice Interviews** appears instead of a dead end.

**How the search engine works** (`src/lib/searchIndex.ts`, no new dependencies)
- **Index:** at load, one list is built from links (with tips), videos, topic guides, and playbook steps.
- **Clean the query:** lowercase, strip accents and punctuation, drop filler words ("the", "how") and single letters, keep at most 8 terms.
- **Synonyms:** student words map to library words, for example "behavioral" → Leadership, "case" → product sense / estimation / strategy / execution, and "deadlines" → APM List.
- **Match:** every term must match. An exact word scores highest, then a word prefix ("behav"), then one typo ("product sence"). Title matches count double, and synonyms count only on an exact match, at a lower weight.
- **Rank:** results show per group only if they score close to that group's best, and the groups shrink when a recommendation is shown.

**Not building:** lock screen or approval changes, new content, analytics, dark mode.

**Success metric:** share of interview-prep search visits that open a video or resource. The baseline is 0 of 22 visits. **Guardrail:** existing searches like "Cursor" still find their card.

**Tested:**
- Local production build, signed in, scripted browser.
- Every check above passes.
- Odd input (symbols, emoji, 3,000 characters, `constructor`) causes no crash.
- Screen widths from 320 to 2560px, keyboard-only use, and signed out all checked.
- All 106 historical searches return results (85 returned nothing before).
- `npm run build` passes, and lint shows 0 errors.

**Known limits:**
- YouTube links were checked by URL only.
- Some links match on their tips, so results can be loose.
- The search text is not kept in the URL, so Back doesn't restore a search.
