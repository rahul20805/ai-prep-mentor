import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  BookOpen,
  Clock,
  ExternalLink,
  Eye,
  KeyRound,
  LinkIcon,
  Play,
  PlusCircle,
  Search,
  X,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import {
  useGetAdminConfig,
  useGetLectureCards,
  useSetYoutubeApiKey,
} from "../hooks/useBackend";
import type { LectureCard } from "../types";

type SubjectFilter =
  | "All"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "Mathematics";

const SUBJECT_FILTERS: SubjectFilter[] = [
  "All",
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
];

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  Chemistry: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  Biology: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  Mathematics: "bg-chart-1/10 text-chart-1 border-chart-1/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname === "youtu.be" || parsed.hostname === "www.youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null;
    }
    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      // Shorts: /shorts/VIDEO_ID
      const shorts = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts) return shorts[1];
    }
  } catch {
    // invalid URL — try regex fallback
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([^&?/\s]{11})/,
    );
    if (match) return match[1];
  }
  return null;
}

function buildLocalLectureCard(videoId: string, rawUrl: string): LectureCard {
  return {
    id: `local-${videoId}`,
    title: `YouTube Video — ${videoId}`,
    channelTitle: "Added by you",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    description: `Manually added from: ${rawUrl.length > 60 ? `${rawUrl.slice(0, 57)}…` : rawUrl}`,
    duration: "",
    viewCount: "",
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LectureCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border bg-card">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

function LectureCardItem({
  card,
  isLocal,
  onRemove,
}: {
  card: LectureCard;
  isLocal?: boolean;
  onRemove?: () => void;
}) {
  const subjectTag =
    SUBJECT_FILTERS.find(
      (s) => s !== "All" && card.title.toLowerCase().includes(s.toLowerCase()),
    ) ?? "Physics";

  const colorClass = SUBJECT_COLORS[subjectTag] ?? SUBJECT_COLORS.Physics;

  return (
    <Card
      className="overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col relative"
      data-ocid="lecture-card"
      onClick={() =>
        window.open(card.videoUrl, "_blank", "noopener,noreferrer")
      }
    >
      {isLocal && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive"
          aria-label="Remove lecture"
          data-ocid="remove-lecture-btn"
        >
          <X size={11} />
        </button>
      )}

      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden flex-shrink-0">
        {card.thumbnailUrl ? (
          <img
            src={card.thumbnailUrl}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Youtube size={32} className="text-muted-foreground/40" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-foreground/20">
          <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center shadow-lg">
            <Play size={20} className="text-primary fill-primary ml-1" />
          </div>
        </div>
        {/* Duration badge */}
        {card.duration && (
          <div className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[11px] font-mono px-1.5 py-0.5 rounded">
            {card.duration}
          </div>
        )}
        {isLocal && (
          <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
            Added
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {card.title}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          {card.channelTitle}
        </p>

        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 border ${colorClass}`}
          >
            {subjectTag}
          </Badge>

          {card.viewCount && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Eye size={11} />
              {card.viewCount}
            </span>
          )}

          {card.duration && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={11} />
              {card.duration}
            </span>
          )}

          <ExternalLink
            size={11}
            className="ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors duration-200"
          />
        </div>
      </div>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      data-ocid="lectures-error-state"
    >
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <AlertCircle size={24} className="text-destructive" />
      </div>
      <div>
        <p className="font-semibold text-foreground">Lectures unavailable</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ subject }: { subject: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      data-ocid="lectures-empty-state"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
        <BookOpen size={24} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No lectures found</p>
        <p className="text-sm text-muted-foreground mt-1">
          No {subject !== "All" ? subject : ""} lectures available right now.
          Use the URL input above to add a YouTube video.
        </p>
      </div>
    </div>
  );
}

function AddLecturePanel({
  onAdd,
}: {
  onAdd: (card: LectureCard) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const videoId = extractYoutubeVideoId(trimmed);
    if (!videoId) {
      setError("Could not find a valid YouTube video ID in that URL.");
      return;
    }
    setError("");
    onAdd(buildLocalLectureCard(videoId, trimmed));
    setUrl("");
  };

  return (
    <div
      className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2"
      data-ocid="add-lecture-panel"
    >
      <div className="flex items-center gap-2 mb-1">
        <LinkIcon size={13} className="text-primary flex-shrink-0" />
        <p className="text-xs font-semibold text-foreground">
          Add a YouTube lecture
        </p>
        <p className="text-xs text-muted-foreground hidden sm:block">
          — paste any YouTube URL and press Add
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 h-9 text-sm"
          data-ocid="youtube-url-input"
        />
        <Button
          size="sm"
          className="h-9 px-4 flex-shrink-0 gap-1.5"
          onClick={handleAdd}
          disabled={!url.trim()}
          data-ocid="add-lecture-btn"
        >
          <PlusCircle size={13} />
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function YoutubeKeyPanel({ onDismiss }: { onDismiss: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const setYoutubeKey = useSetYoutubeApiKey();

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    setYoutubeKey.mutate(trimmed, {
      onSuccess: (ok) => {
        if (ok) {
          setSaved(true);
          setTimeout(onDismiss, 1200);
        }
      },
    });
  };

  return (
    <div
      className="rounded-xl border border-chart-3/25 bg-chart-3/5 p-4 flex flex-col gap-3"
      data-ocid="youtube-key-panel"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
            <KeyRound size={13} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Enable YouTube search
            </p>
            <p className="text-xs text-muted-foreground">
              Enter your YouTube Data API key to load curated lecture results
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex-shrink-0"
          aria-label="Dismiss"
          data-ocid="youtube-panel-dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 text-sm text-chart-5 font-medium py-1">
          <span className="w-2 h-2 rounded-full bg-chart-5 inline-block" />
          API key saved! Loading lectures…
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="AIza••••••••••••••••••••••••••"
            className="flex-1 h-9 text-sm font-mono"
            disabled={setYoutubeKey.isPending}
            data-ocid="youtube-key-input"
          />
          <Button
            size="sm"
            className="h-9 px-4 flex-shrink-0"
            onClick={handleSave}
            disabled={!apiKey.trim() || setYoutubeKey.isPending}
            data-ocid="youtube-key-save-btn"
          >
            {setYoutubeKey.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}

      {setYoutubeKey.isError && (
        <p className="text-xs text-destructive">
          Failed to save key. Please check it's valid and try again.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        Get a free key at{" "}
        <a
          href="https://console.developers.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Google Cloud Console
        </a>
        . Enable the YouTube Data API v3 in your project.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LecturesPage() {
  const [activeSubject, setActiveSubject] = useState<SubjectFilter>("All");
  const [localLectures, setLocalLectures] = useState<LectureCard[]>([]);
  const [showYoutubePanel, setShowYoutubePanel] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: adminConfig } = useGetAdminConfig();
  const youtubeNotConfigured = adminConfig
    ? !adminConfig.youtubeConfigured
    : false;

  // Search query takes priority over subject filter when active
  const isSearchMode = activeSearch.trim().length > 0;
  const querySubject = activeSubject === "All" ? "" : activeSubject;

  const {
    data: fetchedLectures,
    isLoading,
    isError,
    error,
  } = useGetLectureCards(
    isSearchMode ? "" : querySubject,
    isSearchMode ? activeSearch : undefined,
  );

  const handleAddLocal = (card: LectureCard) => {
    setLocalLectures((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev;
      return [card, ...prev];
    });
  };

  const handleRemoveLocal = (id: string) => {
    setLocalLectures((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setActiveSearch(trimmed);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
  };

  // Filter local lectures by active subject (only when not in search mode)
  const filteredLocal = isSearchMode
    ? []
    : activeSubject === "All"
      ? localLectures
      : localLectures.filter((c) =>
          c.title.toLowerCase().includes(activeSubject.toLowerCase()),
        );

  const allLectures = [...filteredLocal, ...(fetchedLectures ?? [])];

  const errorMessage =
    isError && error instanceof Error
      ? error.message.includes("YouTube") || error.message.includes("API")
        ? "YouTube API not configured. Add lectures manually using the URL field above."
        : "Failed to load lectures from YouTube. You can still add videos manually."
      : "YouTube API not configured. Add lectures manually using the URL field above.";

  const totalCount = allLectures.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Youtube size={16} className="text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Video Lectures
              </p>
              <p className="text-xs text-muted-foreground">
                Curated NEET/JEE lecture videos from top educators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalCount} video{totalCount !== 1 ? "s" : ""}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setShowYoutubePanel((v) => !v)}
              aria-label="Configure YouTube API key"
              data-ocid="youtube-settings-toggle"
            >
              <KeyRound size={13} className="mr-1.5" />
              {youtubeNotConfigured ? "Setup API" : "API Key"}
            </Button>
          </div>
        </div>
      </div>

      {/* YouTube Search Bar */}
      <div className="bg-card border-b border-border px-5 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search YouTube for lectures (e.g. Newton's Laws, Organic Chemistry)"
                className="h-10 pl-9 pr-8 text-sm w-full"
                data-ocid="lecture-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <Button
              size="sm"
              className="h-10 px-5 flex-shrink-0 gap-1.5"
              onClick={handleSearch}
              disabled={!searchInput.trim() || isLoading}
              data-ocid="lecture-search-btn"
            >
              <Search size={13} />
              Search
            </Button>
            {isSearchMode && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-3 flex-shrink-0 text-muted-foreground text-xs"
                onClick={handleClearSearch}
                data-ocid="lecture-search-clear"
              >
                <X size={13} className="mr-1" />
                Clear
              </Button>
            )}
          </div>
          {isSearchMode && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Showing results for{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{activeSearch}&rdquo;
              </span>
              {youtubeNotConfigured && (
                <span className="text-destructive ml-2">
                  — YouTube search requires API key
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Subject filter tabs — hidden in search mode */}
      {!isSearchMode && (
        <div className="bg-card border-b border-border px-5 py-2.5 flex-shrink-0">
          <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
            {SUBJECT_FILTERS.map((subject) => (
              <Button
                key={subject}
                variant={activeSubject === subject ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0 h-8 text-xs rounded-full"
                onClick={() => setActiveSubject(subject)}
                data-ocid={`subject-filter-${subject.toLowerCase()}`}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="flex-1 overflow-auto bg-background px-5 py-5"
        data-ocid="lectures-content"
      >
        <div className="max-w-6xl mx-auto space-y-5">
          {/* YouTube API key config panel */}
          {(showYoutubePanel || (isSearchMode && youtubeNotConfigured)) && (
            <YoutubeKeyPanel onDismiss={() => setShowYoutubePanel(false)} />
          )}

          {/* Add lecture via URL */}
          <AddLecturePanel onAdd={handleAddLocal} />

          {/* Search context info */}
          {isSearchMode && youtubeNotConfigured && !showYoutubePanel && (
            <div
              className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm"
              data-ocid="search-api-required-notice"
            >
              <AlertCircle
                size={15}
                className="text-destructive flex-shrink-0"
              />
              <span className="text-muted-foreground">
                YouTube search requires an API key.{" "}
                <button
                  type="button"
                  onClick={() => setShowYoutubePanel(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Enter it below
                </button>
              </span>
            </div>
          )}

          {/* Lecture grid */}
          {isLoading && filteredLocal.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
                <LectureCardSkeleton key={key} />
              ))}
            </div>
          ) : allLectures.length === 0 ? (
            isError ? (
              <ErrorState message={errorMessage} />
            ) : isSearchMode ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-4 text-center"
                data-ocid="search-empty-state"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    No results found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No lectures found for &ldquo;{activeSearch}&rdquo;. Try a
                    different search term.
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState subject={activeSubject} />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLocal.map((card) => (
                <LectureCardItem
                  key={card.id}
                  card={card}
                  isLocal
                  onRemove={() => handleRemoveLocal(card.id)}
                />
              ))}
              {(fetchedLectures ?? []).map((card) => (
                <LectureCardItem key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
