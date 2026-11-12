# Make interview prep findable in Resources

**Goal:** A signed-in PMA member preparing for their first interview can type the phrase their recruiter used and open relevant prep in one click.

## Problem and evidence

Resources search checks card titles and descriptions, but Practice Interviews is a separate section that disappears when a member starts typing. A search can say “No resources found” even when PMA has a relevant video or guide. [Current search code](https://github.com/danielwait2/pma-case-competition/blob/main/src/pages/ResourcesPage.tsx#L320-L330) · [Section visibility](https://github.com/danielwait2/pma-case-competition/blob/main/src/pages/ResourcesPage.tsx#L394-L398)

Weekly active members fell from **41 to 23**. In the Oct. 27–Nov. 9 replay sample, **39 of 46 searches returned zero results**. The **26 visits from 24 members** that hit a zero-result search produced **zero subsequent resource or video opens**. The phrases listed below accounted for **32 of those 39 failed searches** across **22 visits**. These counts come from joining the [click export](https://drive.google.com/file/d/1Vu9afkT2XGIzpWPf_uWgVZrolsH_W-xO/view) to the [site events](https://github.com/danielwait2/pma-case-competition/blob/main/case-kit/events.csv) by session ID and keeping visits to unlocked Resources. They show where visits stalled; they do not establish how much of the weekly decline search caused.

> “I closed it and went to YouTube. I figured PMA just didn’t have interview stuff yet.” — [Owen](https://github.com/danielwait2/pma-case-competition/blob/main/case-kit/interviews/02-owen.md)

## What to ship

**1. Recommended starting point.** Normalize case and whitespace, then match the full query against the three groups below. Show one **Recommended starting point** above every other result, with the video title, duration, a short reason to watch, and a direct **Watch video** link.

| Queries | Result | Why this result |
| --- | --- | --- |
| `case interview`, `case`, `practice interview`, `mock interview videos`, `interview videos` | **PM Interview Rubric: What to Expect** · 5 min | See what interviewers are looking for before attempting a mock. |
| `product sense`, `product sense interview` | **Google PM Mock: Improve Headspace** · 25 min | See how a candidate works through a product sense question. |
| `behavioral`, `behavioral questions`, `behavorial`, `tell me about yourself`, `star method` | **Building a Behavioral Story Bank** · 3 min | Pick stories to practice before drafting answers. |

**2. Search the whole library.** One in-memory index covers all four content sources on the page: the 16 resource links, the 55 practice interview videos, the 8 topic guides, and the 5 APM Playbook steps. It adds a synonym table for the words students use (for example "behavioral" finds Leadership and Drive, and "case" finds product sense, estimation, strategy and execution), prefix matching, and one-typo tolerance. Results are grouped as **Interview guides**, **Practice interview videos**, **APM Playbook**, and **Resources**. Only hits that score close to the best hit of their kind are shown, and the sections shrink when a recommendation is present.

**3. Every result leads somewhere.** **Open guide** clears search, opens that topic's tab in Practice Interviews, and focuses its heading. **Open step** does the same for the APM Playbook step. If nothing matches, **Browse Practice Interviews** appears below the empty message. Existing resource card matches (such as `Cursor`) still appear, clearing the query restores the normal page, and everything stays inside the current membership check.

**Out of scope:** Changes to the lock screen, approval, a free preview, a weekly digest, new video content, and new dependencies.

## Acceptance checks

1. **Recommendation:** `case interview` and `mock interview videos` show the 5 min rubric first. `  PRODUCT   SENSE  ` matches `product sense` (25 min Headspace mock). `behavioral`, `behavorial` and `STAR method` show the 3 min story bank.
2. **Whole library:** `estimation`, `root cause`, `rubric`, `whatsapp` and `product sence` return guides or videos. `apm deadlines` returns the Applications playbook step and the APM List.
3. **Navigation:** **Open guide** on `estimation` lands on the Estimation tab with its heading focused. **Open step** on `apm deadlines` lands on step 4.
4. **Recover and protect:** `zzzz` and `briefcase` show the fallback button, and using it by keyboard focuses Practice Interviews. `Cursor` still shows the Cursor card. Clearing the box or typing only spaces restores the normal page. A 375px screen has no horizontal scroll. Signed out shows the lock screen with no search.
5. **Ship:** `npm run build` passes and `npm run lint` has no errors.

## How to measure it

- **Primary:** Share of member visits with one of the supported queries that open a resource or video after their first supported search, in the same visit. Historical baseline: **0 of 22 visits** for those exact phrases. Count each visit once. Record the recommendation video click as a video open; report guide opens separately so the comparison stays consistent.
- **Diagnostic:** Zero-result rate for the supported phrases. A recommendation counts as a result.
- **Guardrail:** Existing searches like `Cursor` still return their ordinary matches. Watch weekly active members as a longer-term outcome.

The demo verifies the interaction. Measuring the effect after release requires search and open events recorded in the same session.

**Share-out demo:** Type `case interview`. Show the old “No resources found” state, then the new five-minute rubric recommendation. Click it and show the video opening.

## What shipped

- **Files:** `src/lib/resourceSearch.ts` (recommendations), `src/lib/searchIndex.ts` (the index), result sections in `src/pages/ResourcesPage.tsx`, and optional controlled tabs in `PracticeInterviews.tsx` and `ApmPlaybook.tsx`.
- **Verified:** every acceptance check above passed on a local production build signed in as the demo member. `npm run build` passes, and `npm run lint` has 0 errors (the 13 existing warnings).
- **Replay:** I ran all 106 searches in `events.csv` through the new search. None of them return zero results now; 85 did before.
- **Not verified:** the YouTube links were checked by their URLs only, because the test sandbox cannot load YouTube.
- **Known gaps:** some resource links match on their tips text, so a search like `resume` shows a few loosely related links. Clicking a recommendation or video is not recorded as a video open, because the demo has no video tracking, so production instrumentation is a follow-up.
