import ChatLib "../lib/chat";
import DashboardLib "../lib/dashboard";
import ChatTypes "../types/chat";
import PYQTypes "../types/pyq";
import TimetableTypes "../types/timetable";
import Common "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

mixin (
  // Per-user chat messages: Map<Principal, List<ChatMessage>>
  userChatMessages : Map.Map<Principal, List.List<ChatTypes.ChatMessage>>,
  // Per-user chat ID counter: Map<Principal, Nat>
  userChatIds : Map.Map<Principal, Nat>,
  // Per-user attempts for analytics context
  userAttempts : Map.Map<Principal, List.List<PYQTypes.AttemptRecord>>,
  // Per-user tasks for analytics context
  userScheduledTasks : Map.Map<Principal, List.List<TimetableTypes.ScheduledTask>>,
  // Mutable config record (passed by reference)
  config : Common.AppConfig,
) {
  // For update calls: creates entry in map if absent
  func chatGetOrCreateMessages(caller : Principal) : List.List<ChatTypes.ChatMessage> {
    switch (userChatMessages.get(caller)) {
      case (?msgs) msgs;
      case null {
        let msgs = List.empty<ChatTypes.ChatMessage>();
        userChatMessages.add(caller, msgs);
        msgs;
      };
    };
  };

  // For query calls: no map mutation
  func chatGetMessagesReadOnly(caller : Principal) : List.List<ChatTypes.ChatMessage> {
    switch (userChatMessages.get(caller)) {
      case (?msgs) msgs;
      case null List.empty<ChatTypes.ChatMessage>();
    };
  };

  func chatGetNextId(caller : Principal) : Nat {
    switch (userChatIds.get(caller)) {
      case (?n) n;
      case null 0;
    };
  };

  func chatGetAttempts(caller : Principal) : List.List<PYQTypes.AttemptRecord> {
    switch (userAttempts.get(caller)) {
      case (?atts) atts;
      case null List.empty<PYQTypes.AttemptRecord>();
    };
  };

  func chatGetTasks(caller : Principal) : List.List<TimetableTypes.ScheduledTask> {
    switch (userScheduledTasks.get(caller)) {
      case (?tasks) tasks;
      case null List.empty<TimetableTypes.ScheduledTask>();
    };
  };

  func chatDayOfWeek() : Nat {
    let ts = Time.now();
    let secondsSinceEpoch = ts / 1_000_000_000;
    let daysSinceEpoch = secondsSinceEpoch / 86400;
    ((daysSinceEpoch + 3) % 7).toNat();
  };

  public shared ({ caller }) func sendChatMessage(text : Text) : async [ChatTypes.ChatMessage] {
    let msgs = chatGetOrCreateMessages(caller);
    let currentId = chatGetNextId(caller);
    let now = Time.now();

    let userMsg : ChatTypes.ChatMessage = {
      id = currentId;
      role = #user;
      content = text;
      timestamp = now;
    };

    // Build per-user analytics context for the system prompt
    let dayIndex = chatDayOfWeek();
    let atts = chatGetAttempts(caller);
    let tasks = chatGetTasks(caller);
    let stats = DashboardLib.getStats(tasks, atts, dayIndex);

    // Get LLM response — real Groq call if key is set, fallback message otherwise
    let replyContent = if (config.groqApiKey.size() > 0) {
      await ChatLib.callGroq(
        config.groqApiKey,
        text,
        stats.weakSubjects,
        stats.overallAccuracyPercent,
        msgs.toArray(),
      );
    } else {
      "AI mentor is not configured yet. Please ask the admin to set the Groq API key via setGroqApiKey.";
    };

    let mentorMsg : ChatTypes.ChatMessage = {
      id = currentId + 1;
      role = #mentor;
      content = replyContent;
      timestamp = Time.now();
    };

    ChatLib.addMessages(msgs, userMsg, mentorMsg);
    userChatIds.add(caller, currentId + 2);
    msgs.toArray();
  };

  public shared query ({ caller }) func getChatHistory() : async [ChatTypes.ChatMessage] {
    ChatLib.getHistory(chatGetMessagesReadOnly(caller));
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    ChatLib.clearHistory(chatGetOrCreateMessages(caller));
    userChatIds.add(caller, 0);
  };

  // ── Admin configuration ────────────────────────────────────────────────────

  public shared func setGroqApiKey(key : Text) : async Bool {
    config.groqApiKey := key;
    true;
  };

  public shared func setYoutubeApiKey(key : Text) : async Bool {
    config.youtubeApiKey := key;
    true;
  };

  public shared query func getAdminConfig() : async { groqConfigured : Bool; youtubeConfigured : Bool } {
    {
      groqConfigured = config.groqApiKey.size() > 0;
      youtubeConfigured = config.youtubeApiKey.size() > 0;
    };
  };

};
