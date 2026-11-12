import { PLAYBOOK_STEPS } from "@/lib/apmPlaybook";
import { RESOURCE_CATEGORIES } from "@/lib/resources";
import { VIDEO_LIBRARY, type LibraryVideo } from "@/lib/videoLibrary";
import { normalizeQuery } from "@/lib/resourceSearch";

export type SearchEntry =
  | { kind: "resource"; key: string; title: string; text: string; categorySlug: string }
  | { kind: "video"; key: string; title: string; text: string; topicSlug: string; video: LibraryVideo }
  | { kind: "topic"; key: string; title: string; text: string; topicSlug: string; description: string }
  | { kind: "playbook"; key: string; title: string; text: string; stepId: string; lede: string };

export type SearchHit = SearchEntry & { score: number };

// Words students use mapped to the words the library uses.
const SYNONYMS: Record<string, string[]> = {
  case: ["product sense", "product design", "estimation", "strategy", "execution"],
  behavioral: ["leadership", "story bank", "stpar"],
  behavioural: ["behavioral"],
  behavorial: ["behavioral"],
  behavior: ["behavioral"],
  "star method": ["stpar", "behavioral", "story bank"],
  star: ["stpar", "behavioral"],
  "tell me about yourself": ["introductions", "introduction", "story bank"],
  intro: ["introductions"],
  design: ["product sense", "product design"],
  "product design": ["product sense"],
  metrics: ["execution", "analytical", "goals", "metric"],
  metric: ["metrics"],
  "root cause": ["execution", "analytical", "decline", "drop"],
  analytical: ["execution", "metrics"],
  "a/b": ["a/b tests", "experiment"],
  estimation: ["market sizing", "sizing", "estimate"],
  estimate: ["estimation"],
  guesstimate: ["estimation"],
  sizing: ["estimation"],
  "market sizing": ["estimation"],
  strategy: ["market entry", "growth", "go to market"],
  gtm: ["go to market"],
  technical: ["system design", "under the hood"],
  "system design": ["technical"],
  resume: ["resumes"],
  resumes: ["resume"],
  internship: ["internships", "apm", "intern"],
  internships: ["internship"],
  jobs: ["job", "postings", "apm"],
  job: ["postings", "jobs"],
  deadlines: ["deadline", "calendar", "applications", "apm list"],
  deadline: ["deadlines"],
  networking: ["network", "coffee chat", "referrals", "slack"],
  referral: ["referrals"],
  "coffee chat": ["networking"],
  apm: ["associate product manager"],
  ai: ["build with ai", "cursor", "lovable", "claude code"],
  portfolio: ["side project", "build"],
  google: ["google"],
  meta: ["meta", "facebook"],
  facebook: ["meta"],
};

const GENERIC = new Set(["pm", "interview", "interviews", "mock", "mocks", "video", "videos", "practice", "prep", "questions", "question", "help", "resources", "resource", "tips"]);
const STOP = new Set(["a", "an", "the", "for", "to", "of", "and", "in", "on", "how", "i", "my", "with", "is", "do", "what", "about"]);

const clean = (text: string) => normalizeQuery(text.replace(/[^a-zA-Z0-9/ ]+/g, " "));

const words = (text: string) => clean(text).split(" ").filter(Boolean);

const withinOneEdit = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (i === a.length || i === b.length) return true;
  return (
    a.slice(i + 1) === b.slice(i + 1) ||
    a.slice(i) === b.slice(i + 1) ||
    a.slice(i + 1) === b.slice(i) ||
    (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2))
  );
};

// 3 = exact word or phrase, 2 = word starts with term, 1 = one typo away, 0 = no match
const matchStrength = (term: string, haystack: string, haystackWords: string[]) => {
  if (` ${haystack} `.includes(` ${term} `)) return 3;
  if (term.includes(" ")) return 0;
  if (term.length >= 4 && haystackWords.some((w) => w.startsWith(term))) return 2;
  if (term.length >= 5 && haystackWords.some((w) => w.length >= 5 && withinOneEdit(term, w))) return 1;
  return 0;
};

const buildIndex = (): SearchEntry[] => {
  const entries: SearchEntry[] = [];

  for (const category of RESOURCE_CATEGORIES) {
    for (const resource of category.resources) {
      entries.push({
        kind: "resource",
        key: `resource:${resource.title}`,
        title: resource.title,
        text: [resource.description, category.title, category.description, ...resource.tips].join(" "),
        categorySlug: category.slug,
      });
    }
  }

  for (const topic of VIDEO_LIBRARY) {
    const guide = topic.guide;
    entries.push({
      kind: "topic",
      key: `topic:${topic.slug}`,
      title: topic.title,
      description: topic.description,
      text: [topic.description, guide?.tests, guide?.where, ...(guide?.approach ?? []), ...(guide?.works ?? []), ...(guide?.hurts ?? [])]
        .filter(Boolean)
        .join(" "),
      topicSlug: topic.slug,
    });
    for (const video of topic.videos) {
      entries.push({
        kind: "video",
        key: `video:${video.youtubeId}`,
        title: video.title,
        text: `${topic.title} ${topic.description}`,
        topicSlug: topic.slug,
        video,
      });
    }
  }

  for (const step of PLAYBOOK_STEPS) {
    entries.push({
      kind: "playbook",
      key: `playbook:${step.id}`,
      title: step.title,
      lede: step.lede,
      text: [step.shortTitle, step.lede, step.callout, ...step.lists.flatMap((list) => [list.heading, ...list.items]), ...step.links.map((l) => l.label)].join(" "),
      stepId: step.id,
    });
  }

  return entries;
};

const INDEX = buildIndex().map((entry) => {
  const title = clean(entry.title);
  const text = clean(entry.text);
  return { entry, title, titleWords: title.split(" "), text, textWords: text.split(" ") };
});

const queryTerms = (query: string) => {
  const q = clean(query);
  const terms: string[] = [];
  const all = words(q).filter((w) => !STOP.has(w));
  let rest = ` ${all.join(" ")} `;
  for (const phrase of Object.keys(SYNONYMS).filter((k) => k.includes(" "))) {
    if (rest.includes(` ${phrase} `)) {
      terms.push(phrase);
      rest = rest.replace(` ${phrase} `, " ");
    }
  }
  terms.push(...rest.split(" ").filter(Boolean));
  const specific = terms.filter((t) => !GENERIC.has(t));
  return specific.length > 0 ? specific : terms;
};

export const searchIndex = (query: string): SearchHit[] => {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const fullPhrase = clean(query);

  const hits: SearchHit[] = [];
  for (const item of INDEX) {
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      const options = [term, ...(SYNONYMS[term] ?? []).map(clean)];
      let best = 0;
      options.forEach((option, idx) => {
        const weight = idx === 0 ? 1 : 0.6;
        const strength = (hay: string, hayWords: string[]) => {
          const m = matchStrength(option, hay, hayWords);
          return idx === 0 || m === 3 ? m : 0;
        };
        const inTitle = strength(item.title, item.titleWords) * 2;
        const inText = strength(item.text, item.textWords);
        best = Math.max(best, Math.max(inTitle, inText) * weight);
      });
      if (best === 0) {
        matchedAll = false;
        break;
      }
      score += best;
    }
    if (!matchedAll) continue;
    if (fullPhrase.includes(" ") && item.title.includes(fullPhrase)) score += 4;
    if (item.entry.kind === "video" && item.entry.video.startHere) score += 0.5;
    hits.push({ ...item.entry, score });
  }

  return hits.sort((a, b) => b.score - a.score);
};

export interface GroupedResults {
  resourceTitles: string[];
  topics: Extract<SearchHit, { kind: "topic" }>[];
  videos: Extract<SearchHit, { kind: "video" }>[];
  playbook: Extract<SearchHit, { kind: "playbook" }>[];
}

export const groupResults = (hits: SearchHit[], excludeVideoId?: string, maxVideos = 8): GroupedResults => ({
  resourceTitles: hits.filter((h) => h.kind === "resource").slice(0, 6).map((h) => h.title),
  topics: hits.filter((h): h is Extract<SearchHit, { kind: "topic" }> => h.kind === "topic").slice(0, 3),
  videos: hits
    .filter((h): h is Extract<SearchHit, { kind: "video" }> => h.kind === "video" && h.video.youtubeId !== excludeVideoId)
    .slice(0, maxVideos),
  playbook: hits.filter((h): h is Extract<SearchHit, { kind: "playbook" }> => h.kind === "playbook").slice(0, 2),
});
