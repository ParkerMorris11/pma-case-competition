import { VIDEO_LIBRARY, type LibraryVideo, type VideoTopic } from "@/lib/videoLibrary";

const TOPIC_SYNONYMS: Record<string, string[]> = {
  basics: ["interview structure", "rubric", "interview process", "what to expect", "pm interview", "first round"],
  "product-sense": [
    "product sense",
    "product design",
    "case",
    "design",
    "improve",
    "favorite product",
    "user problem",
  ],
  strategy: ["strategy", "go to market", "gtm", "market entry", "competition", "growth"],
  execution: ["execution", "analytical", "metrics", "metric", "root cause", "a/b", "ab test", "goals", "kpi", "success"],
  estimation: ["estimation", "estimate", "market sizing", "market size", "sizing", "guesstimate", "fermi"],
  behavioral: [
    "behavioral",
    "behavioural",
    "behavorial",
    "behavior",
    "star",
    "star method",
    "tell me about yourself",
    "why this company",
    "leadership",
    "story",
    "stories",
  ],
  technical: ["technical", "system design", "engineering", "api", "how it works"],
  "breaking-in": ["breaking in", "apm", "internship", "resume", "career", "new grad", "networking", "coffee chat"],
};

const GENERIC_WORDS = new Set([
  "pm",
  "interview",
  "interviews",
  "mock",
  "mocks",
  "video",
  "videos",
  "practice",
  "prep",
  "preparation",
  "question",
  "questions",
  "help",
  "resources",
  "resource",
]);

const STOP_WORDS = new Set(["a", "an", "the", "for", "to", "of", "and", "in", "on", "how", "me", "my", "i", "with", "is"]);

export const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasPhrase = (haystack: string, phrase: string) => ` ${haystack} `.includes(` ${phrase} `);

const tokens = (query: string) => normalize(query).split(" ").filter((t) => t && !STOP_WORDS.has(t));

export const keyTerms = (query: string) => tokens(query).filter((t) => !GENERIC_WORDS.has(t));

export const isInterviewQuery = (query: string) => {
  const q = normalize(query);
  return tokens(query).some((t) => GENERIC_WORDS.has(t)) || matchTopics(q).length > 0;
};

const matchTopics = (normalizedQuery: string): VideoTopic[] =>
  VIDEO_LIBRARY.filter((topic) => {
    if ((TOPIC_SYNONYMS[topic.slug] ?? []).some((syn) => hasPhrase(normalizedQuery, normalize(syn)))) return true;
    const text = normalize(`${topic.title} ${topic.description}`);
    return keyTerms(normalizedQuery).some((t) => t.length >= 4 && hasPhrase(text, t));
  });

export interface VideoSearchGroup {
  topic: VideoTopic;
  videos: LibraryVideo[];
}

const sortStartHere = (videos: LibraryVideo[]) =>
  [...videos].sort((a, b) => Number(Boolean(b.startHere)) - Number(Boolean(a.startHere)) || a.minutes - b.minutes);

export const searchVideos = (query: string, perTopic = 4): VideoSearchGroup[] => {
  const q = normalize(query);
  if (!q) return [];

  const terms = keyTerms(query);
  const topics = matchTopics(q);
  const groups = new Map<string, VideoSearchGroup>();

  for (const topic of topics) {
    groups.set(topic.slug, { topic, videos: sortStartHere(topic.videos).slice(0, perTopic) });
  }

  if (terms.length > 0) {
    for (const topic of VIDEO_LIBRARY) {
      const hits = topic.videos.filter((video) => terms.every((t) => hasPhrase(normalize(video.title), t)));
      if (hits.length === 0) continue;
      const group = groups.get(topic.slug) ?? { topic, videos: [] };
      for (const video of hits) {
        if (!group.videos.some((v) => v.youtubeId === video.youtubeId)) group.videos.push(video);
      }
      groups.set(topic.slug, group);
    }
  }

  if (groups.size === 0 && terms.length === 0 && tokens(query).some((t) => GENERIC_WORDS.has(t))) {
    for (const topic of VIDEO_LIBRARY) {
      const starters = topic.videos.filter((v) => v.startHere);
      if (starters.length > 0) groups.set(topic.slug, { topic, videos: starters });
    }
  }

  return [...groups.values()].filter((g) => g.videos.length > 0);
};

export const matchesResource = (query: string, fields: string[]) => {
  const q = normalize(query);
  if (!q) return false;
  const text = normalize(fields.join(" "));
  if (text.includes(q)) return true;
  const terms = keyTerms(query);
  return terms.length > 0 && terms.every((t) => hasPhrase(text, t));
};

export const SUGGESTED_SEARCHES = ["Product sense", "Behavioral", "Estimation", "Case interview", "APM deadlines"];
