import ChatTypes "../types/chat";
import Common "../types/common";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";

module {

  type Msg = ChatTypes.ChatMessage;

  // ── HTTP Outcall types for IC management canister ─────────────────────────

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

  // ── JSON helpers ──────────────────────────────────────────────────────────

  // Find the value of a JSON string field by searching for the first "key":"value" pattern
  func extractStringField(json : Text, key : Text) : Text {
    let needle = "\"" # key # "\":\"";
    var found = "";
    let segments = json.split(#text needle);
    switch (segments.next()) {
      case null {};
      case (?_) {
        switch (segments.next()) {
          case null {};
          case (?afterKey) {
            let valueParts = afterKey.split(#char '\"');
            switch (valueParts.next()) {
              case null {};
              case (?v) {
                found := v;
              };
            };
          };
        };
      };
    };
    found;
  };

  // ── JSON escape for request body ──────────────────────────────────────────

  func escapeJson(s : Text) : Text {
    s.replace(#char '\\', "\\\\")
     .replace(#char '\"', "\\\"")
     .replace(#char '\n', "\\n")
     .replace(#char '\r', "\\r")
     .replace(#char '\t', "\\t");
  };

  // ── Build Groq API request body ───────────────────────────────────────────

  func buildGroqBody(
    userText : Text,
    weakSubjects : [Common.Subject],
    accuracyPercent : Nat,
    history : [Msg],
  ) : Text {
    let weakList = if (weakSubjects.size() == 0) "none identified"
      else weakSubjects.values().foldLeft(
        "",
        func(acc : Text, s : Text) : Text {
          if (acc == "") s else acc # ", " # s
        }
      );

    let systemPrompt = "You are an expert NEET/JEE exam preparation mentor. " #
      "The student's current accuracy is " # accuracyPercent.toText() # "%. " #
      "Their weak subjects are: " # weakList # ". " #
      "Give concise, actionable advice specific to NEET/JEE preparation. " #
      "Keep responses under 200 words. Be encouraging and specific.";

    var messagesJson = "{\"role\":\"system\",\"content\":\"" # escapeJson(systemPrompt) # "\"}";

    // Include last 6 messages from history for context
    let histSize = history.size();
    let startIdx : Nat = if (histSize > 6) histSize - 6 else 0;
    var i = 0;
    for (msg in history.values()) {
      if (i >= startIdx) {
        let role = switch (msg.role) { case (#user) "user"; case (#mentor) "assistant" };
        messagesJson #= ",{\"role\":\"" # role # "\",\"content\":\"" # escapeJson(msg.content) # "\"}";
      };
      i += 1;
    };

    messagesJson #= ",{\"role\":\"user\",\"content\":\"" # escapeJson(userText) # "\"}";

    "{\"model\":\"llama3-8b-8192\",\"messages\":[" # messagesJson # "],\"max_tokens\":300,\"temperature\":0.7}";
  };

  // ── Call Groq API ─────────────────────────────────────────────────────────

  public func callGroq<system>(
    apiKey : Text,
    userText : Text,
    weakSubjects : [Common.Subject],
    accuracyPercent : Nat,
    history : [Msg],
  ) : async Text {
    let body = buildGroqBody(userText, weakSubjects, accuracyPercent, history);
    let bodyBlob = body.encodeUtf8();

    let request : HttpRequestArgs = {
      url = "https://api.groq.com/openai/v1/chat/completions";
      max_response_bytes = ?16000;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # apiKey },
      ];
      body = ?bodyBlob;
      transform = null;
      is_replicated = ?false;
    };

    try {
      let response = await ic.http_request(request);
      let responseText = switch (response.body.decodeUtf8()) {
        case null { return "I'm having trouble connecting right now. Please try again." };
        case (?t) t;
      };

      if (response.status != 200) {
        return "The AI mentor is temporarily unavailable (status " # response.status.toText() # "). Please try again shortly.";
      };

      let contentVal = extractStringField(responseText, "content");
      if (contentVal.size() > 0) {
        contentVal
          .replace(#text "\\n", "\n")
          .replace(#text "\\\"", "\"")
          .replace(#text "\\'", "'");
      } else {
        "I'm having trouble processing the response. Please try again.";
      };
    } catch (_) {
      "I'm currently unavailable. Please check back shortly or try rephrasing your question.";
    };
  };

  // ── Message management ────────────────────────────────────────────────────

  public func addMessages(messages : List.List<Msg>, userMsg : Msg, mentorMsg : Msg) {
    messages.add(userMsg);
    messages.add(mentorMsg);
  };

  public func getHistory(messages : List.List<Msg>) : [Msg] {
    messages.toArray();
  };

  public func clearHistory(messages : List.List<Msg>) {
    messages.clear();
  };
};
