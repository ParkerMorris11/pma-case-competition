# Make interview prep findable in Resources

**Goal:** A signed-in PMA member preparing for their first interview can type the phrase their recruiter used and open relevant prep in one click.

## Problem and evidence

Resources search checks card titles and descriptions, but Practice Interviews is a separate section that disappears when a member starts typing. A search can say “No resources found” even when PMA has a relevant video or guide. [Current search code](https://github.com/danielwait2/pma-case-competition/blob/main/src/pages/ResourcesPage.tsx#L320-L330) · [Section visibility](https://github.com/danielwait2/pma-case-competition/blob/main/src/pages/ResourcesPage.tsx#L394-L398)

Weekly active members fell from **41 to 23**. In the Oct. 27–Nov. 9 replay sample, **39 of 46 searches returned zero results**. The **26 visits from 24 members** that hit a zero-result search produced **zero subsequent resource or video opens**. The phrases listed below accounted for **32 of those 39 failed searches** across **22 visits**. These counts come from joining the [click export](https://drive.google.com/file/d/1Vu9afkT2XGIzpWPf_uWgVZrolsH_W-xO/view) to the [site events](https://github.com/danielwait2/pma-case-competition/blob/main/case-kit/events.csv) by session ID and keeping visits to unlocked Resources. They show where visits stalled; they do not establish how much of the weekly decline search caused.

> “I closed it and went to YouTube. I figured PMA just didn’t have interview stuff yet.” — [Owen](https://github.com/danielwait2/pma-case-competition/blob/main/case-kit/interviews/02-owen.md)

## What to ship

Normalize case and whitespace, then match the full query against the three groups below. Show one **Recommended starting point** above any ordinary results. Give it the existing video title, duration, a short reason to watch, and a direct **Watch video** link.

| Queries | Result | Why this result |
| --- | --- | --- |
| `case interview`, `case`, `practice interview`, `mock interview videos`, `interview videos` | **PM Interview Rubric: What to Expect** · 5 min | See what interviewers are looking for before attempting a mock. |
| `product sense`, `product sense interview` | **Google PM Mock: Improve Headspace** · 25 min | See how a candidate works through a product sense question. If the branch already supports topic links, offer **Read the Product Sense guide** as a quicker alternative. |
| `behavioral`, `behavioral questions`, `behavorial`, `tell me about yourself`, `star method` | **Building a Behavioral Story Bank** · 3 min | Pick stories to practice before drafting answers. |

If a query has neither a recommendation nor a normal match, show **Browse Practice Interviews** below the empty message. That button clears search, takes the member to the section, and moves keyboard focus to its heading. Clearing the query manually restores the normal page. Existing card matches remain available. The fix uses the existing [video library](https://github.com/danielwait2/pma-case-competition/blob/main/src/lib/videoLibrary.ts#L24) and stays inside the current membership check.

**Out of scope:** Changes to the lock screen, approval, a free preview, a weekly digest, new video content, and a full search rewrite.

## Implementation and acceptance checks

1. **Match:** Add or verify the three phrase groups in the [Resources page](https://github.com/danielwait2/pma-case-competition/blob/main/src/pages/ResourcesPage.tsx). Resolve videos from the existing library by ID. Confirm `  PRODUCT   SENSE  ` resolves the same way as `product sense`.
2. **Show:** Render the recommendation even if there are zero ordinary matches. Try `case interview`, `product sense`, and `behavioral`. Each should show the correct title and duration, and each link should open the correct video. Check the card on a narrow screen.
3. **Recover:** Search for `zzzz` and use the fallback with a keyboard. The Practice Interviews heading should be visible and focused. Search for `Cursor` and verify the existing card still appears. Clear the field and verify normal browsing returns.
4. **Protect and ship:** Sign out and check that member-only search is still locked. Run `npm run build`. Demo the search fix in the browser, and submit only that branch's PR. If the built branch differs from this spec, fix the gap or update the PR description to match what actually ships.

## How to measure it

- **Primary:** Share of member visits with one of the supported queries that open a resource or video after their first supported search, in the same visit. Historical baseline: **0 of 22 visits** for those exact phrases. Count each visit once. Record the recommendation video click as a video open; report guide opens separately so the comparison stays consistent.
- **Diagnostic:** Zero-result rate for the supported phrases. A recommendation counts as a result.
- **Guardrail:** Existing searches like `Cursor` still return their ordinary matches. Watch weekly active members as a longer-term outcome.

The demo verifies the interaction. Measuring the effect after release requires search and open events recorded in the same session.

**Share-out demo:** Type `case interview`. Show the old “No resources found” state, then the new five-minute rubric recommendation. Click it and show the video opening.

## What shipped

The phrase groups live in `src/lib/resourceSearch.ts`, and the recommendation card and fallback button in `src/pages/ResourcesPage.tsx`. Every browser check in this spec passed on a local production build. `npm run build` passes, and `npm run lint` reports 0 errors (the 13 existing warnings).

Two gaps from the spec:

- The Product Sense recommendation has no **Read the Product Sense guide** link, because the page has no topic links yet.
- Clicking the recommendation is not recorded as a video open. The demo site has no video open tracking, so production instrumentation is a follow-up.
