import { VIDEO_LIBRARY, type LibraryVideo } from "@/lib/videoLibrary";

export interface SearchRecommendation {
  video: LibraryVideo;
  reason: string;
}

const GROUPS: { queries: string[]; youtubeId: string; reason: string }[] = [
  {
    queries: ["case interview", "case", "practice interview", "mock interview videos", "interview videos"],
    youtubeId: "_4vhjxOuA-A",
    reason: "See what interviewers are looking for before attempting a mock.",
  },
  {
    queries: ["product sense", "product sense interview"],
    youtubeId: "BNuRsv_42jc",
    reason: "See how a candidate works through a product sense question.",
  },
  {
    queries: ["behavioral", "behavioral questions", "behavorial", "tell me about yourself", "star method"],
    youtubeId: "p8JTbk5UoFM",
    reason: "Pick stories to practice before drafting answers.",
  },
];

export const normalizeQuery = (query: string) => query.toLowerCase().trim().replace(/\s+/g, " ");

const findVideo = (youtubeId: string) =>
  VIDEO_LIBRARY.flatMap((topic) => topic.videos).find((video) => video.youtubeId === youtubeId);

export const getRecommendation = (query: string): SearchRecommendation | null => {
  const normalized = normalizeQuery(query);
  const group = GROUPS.find((g) => g.queries.includes(normalized));
  if (!group) return null;
  const video = findVideo(group.youtubeId);
  return video ? { video, reason: group.reason } : null;
};
