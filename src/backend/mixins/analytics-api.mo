import AnalyticsLib "../lib/analytics";
import AnalyticsTypes "../types/analytics";
import PYQTypes "../types/pyq";
import TimetableTypes "../types/timetable";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

mixin (
  // Per-user attempts
  userAttempts : Map.Map<Principal, List.List<PYQTypes.AttemptRecord>>,
  // Shared questions
  questions : List.List<PYQTypes.Question>,
  // Per-user tasks
  userScheduledTasks : Map.Map<Principal, List.List<TimetableTypes.ScheduledTask>>,
) {
  func analyticsGetAttempts(caller : Principal) : List.List<PYQTypes.AttemptRecord> {
    switch (userAttempts.get(caller)) {
      case (?atts) atts;
      case null List.empty<PYQTypes.AttemptRecord>();
    };
  };

  func analyticsGetTasks(caller : Principal) : List.List<TimetableTypes.ScheduledTask> {
    switch (userScheduledTasks.get(caller)) {
      case (?tasks) tasks;
      case null List.empty<TimetableTypes.ScheduledTask>();
    };
  };

  public shared query ({ caller }) func getAnalyticsSummary() : async AnalyticsTypes.AnalyticsSummary {
    let atts = analyticsGetAttempts(caller);
    let tasks = analyticsGetTasks(caller);
    AnalyticsLib.getSummary(atts, questions, tasks, Time.now());
  };
};
