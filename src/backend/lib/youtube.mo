import Common "../types/common";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import List "mo:core/List";

module {

  type LectureCard = Common.LectureCard;

  // ── HTTP Outcall types ────────────────────────────────────────────────────

  type HttpHeader = { name : Text; value : Text };
  type HttpResult = {
    status : Nat;
    headers : [HttpHeader];
    body : Blob;
  };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{ function : shared query ({ response : HttpResult; context : Blob }) -> async HttpResult; context : Blob };
    is_replicated : ?Bool;
  };

  type ManagementCanister = actor {
    http_request : (HttpRequestArgs) -> async HttpResult;
  };

  let ic : ManagementCanister = actor "aaaaa-aa";

  // ── JSON string field extractor ───────────────────────────────────────────

  func extractStringField(json : Text, key : Text) : Text {
    let needle = "\"" # key # "\":\"";
    let segments = json.split(#text needle);
    switch (segments.next()) {
      case null "";
      case (?_) {
        switch (segments.next()) {
          case null "";
          case (?afterKey) {
            let valueParts = afterKey.split(#char '\"');
            switch (valueParts.next()) {
              case null "";
              case (?v) v;
            };
          };
        };
      };
    };
  };

  func urlEncode(s : Text) : Text {
    s.replace(#char ' ', "+")
     .replace(#char '&', "%26")
     .replace(#char '=', "%3D")
     .replace(#char '?', "%3F")
     .replace(#char '#', "%23");
  };

  // ── Parse YouTube search response ─────────────────────────────────────────

  func parseSearchItems(json : Text) : [(Text, Text, Text, Text, Text)] {
    let results : List.List<(Text, Text, Text, Text, Text)> = List.empty();

    let parts = json.split(#text "\"videoId\":\"");
    switch (parts.next()) {
      case null { return [] };
      case (?_) {};
    };

    var count = 0;
    var nextPart = parts.next();
    while (count < 10) {
      switch (nextPart) {
        case null { count := 10 };
        case (?part) {
          let vidParts = part.split(#char '\"');
          let videoId = switch (vidParts.next()) {
            case null "";
            case (?v) v;
          };
          if (videoId.size() > 0) {
            let title = extractStringField(part, "title");
            let channel = extractStringField(part, "channelTitle");
            let desc = extractStringField(part, "description");
            let thumb = extractStringField(part, "url");
            results.add((videoId, title, channel, desc, thumb));
          };
          count += 1;
          nextPart := parts.next();
        };
      };
    };
    results.toArray();
  };

  // ── Parse YouTube video details response ──────────────────────────────────

  func parseVideoDetails(json : Text) : [(Text, Text)] {
    let results : List.List<(Text, Text)> = List.empty();

    let parts = json.split(#text "\"duration\":\"");
    switch (parts.next()) {
      case null { return [] };
      case (?_) {};
    };

    var count = 0;
    var nextPart = parts.next();
    while (count < 10) {
      switch (nextPart) {
        case null { count := 10 };
        case (?part) {
          let durParts = part.split(#char '\"');
          let duration = switch (durParts.next()) {
            case null "";
            case (?v) v;
          };
          let viewCount = extractStringField(part, "viewCount");
          results.add((duration, viewCount));
          count += 1;
          nextPart := parts.next();
        };
      };
    };
    results.toArray();
  };

  // ── Main fetch function ───────────────────────────────────────────────────

  public func fetchLectureCards<system>(apiKey : Text, subject : Text, searchQuery : ?Text) : async [LectureCard] {
    let rawQuery = switch (searchQuery) {
      case (?q) if (q.size() > 0) q else subject;
      case null subject;
    };
    let encodedQuery = urlEncode(rawQuery);
    let searchUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" #
      encodedQuery # "+NEET+JEE&type=video&maxResults=10&key=" # apiKey;

    let searchReq : HttpRequestArgs = {
      url = searchUrl;
      max_response_bytes = ?50000;
      method = #get;
      headers = [{ name = "Accept"; value = "application/json" }];
      body = null;
      transform = null;
      is_replicated = ?false;
    };

    let searchResp = try {
      await ic.http_request(searchReq);
    } catch (_) {
      return [];
    };

    if (searchResp.status != 200) return [];

    let searchJson = switch (searchResp.body.decodeUtf8()) {
      case null { return [] };
      case (?t) t;
    };

    let searchItems = parseSearchItems(searchJson);
    if (searchItems.size() == 0) return [];

    var videoIdsCsv = "";
    var idx = 0;
    for ((vid, _, _, _, _) in searchItems.values()) {
      if (idx > 0) videoIdsCsv #= "%2C";
      videoIdsCsv #= vid;
      idx += 1;
    };

    let detailsUrl = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=" #
      videoIdsCsv # "&key=" # apiKey;

    let detailsReq : HttpRequestArgs = {
      url = detailsUrl;
      max_response_bytes = ?30000;
      method = #get;
      headers = [{ name = "Accept"; value = "application/json" }];
      body = null;
      transform = null;
      is_replicated = ?false;
    };

    let detailsJson = try {
      let resp = await ic.http_request(detailsReq);
      switch (resp.body.decodeUtf8()) {
        case null "";
        case (?t) t;
      };
    } catch (_) { "" };

    let details = if (detailsJson.size() > 0) parseVideoDetails(detailsJson) else [];

    let cards : List.List<LectureCard> = List.empty();
    var i = 0;
    for ((vid, title, channel, desc, thumb) in searchItems.values()) {
      var duration = "";
      var viewCount = "";
      if (i < details.size()) {
        let (dur, views) = details[i];
        duration := dur;
        viewCount := views;
      };
      cards.add({
        id = vid;
        title = if (title.size() > 0) title else "Lecture Video";
        channelTitle = if (channel.size() > 0) channel else "YouTube";
        description = desc;
        thumbnailUrl = if (thumb.size() > 0) thumb
          else "https://img.youtube.com/vi/" # vid # "/mqdefault.jpg";
        videoUrl = "https://www.youtube.com/watch?v=" # vid;
        duration = duration;
        viewCount = viewCount;
      });
      i += 1;
    };
    cards.toArray();
  };
};
