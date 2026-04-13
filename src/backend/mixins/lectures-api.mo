import YoutubeLib "../lib/youtube";
import Common "../types/common";

mixin (
  config : Common.AppConfig,
) {
  public shared func getLectureCards(subject : Text, searchQuery : ?Text) : async [Common.LectureCard] {
    if (config.youtubeApiKey.size() == 0) {
      return [];
    };
    let searchTerm = switch (searchQuery) {
      case (?q) if (q.size() > 0) q else subject;
      case null subject;
    };
    await YoutubeLib.fetchLectureCards(config.youtubeApiKey, subject, ?searchTerm);
  };
};
