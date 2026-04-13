import DashboardLib "../lib/dashboard";
import DashboardTypes "../types/dashboard";
import TimetableTypes "../types/timetable";
import PYQTypes "../types/pyq";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

mixin (
  // Per-user tasks: Map<Principal, List<ScheduledTask>>
  userScheduledTasks : Map.Map<Principal, List.List<TimetableTypes.ScheduledTask>>,
  // Per-user task ID counter
  userTaskIds : Map.Map<Principal, Nat>,
  // Shared questions for global stats reference
  questions : List.List<PYQTypes.Question>,
  // Per-user attempts
  userAttempts : Map.Map<Principal, List.List<PYQTypes.AttemptRecord>>,
) {
  func dashboardDayOfWeek(ts : Int) : Nat {
    let secondsSinceEpoch = ts / 1_000_000_000;
    let daysSinceEpoch = secondsSinceEpoch / 86400;
    ((daysSinceEpoch + 3) % 7).toNat();
  };

  func dashboardGetTasks(caller : Principal) : List.List<TimetableTypes.ScheduledTask> {
    switch (userScheduledTasks.get(caller)) {
      case (?tasks) tasks;
      case null List.empty<TimetableTypes.ScheduledTask>();
    };
  };

  func dashboardGetAttempts(caller : Principal) : List.List<PYQTypes.AttemptRecord> {
    switch (userAttempts.get(caller)) {
      case (?atts) atts;
      case null List.empty<PYQTypes.AttemptRecord>();
    };
  };

  public shared query ({ caller }) func getDashboardStats() : async DashboardTypes.DashboardStats {
    let tasks = dashboardGetTasks(caller);
    let atts = dashboardGetAttempts(caller);
    let dayIndex = dashboardDayOfWeek(Time.now());
    DashboardLib.getStats(tasks, atts, dayIndex);
  };

  public shared query ({ caller }) func getTodayTasks() : async [DashboardTypes.TodayTask] {
    let tasks = dashboardGetTasks(caller);
    let dayIndex = dashboardDayOfWeek(Time.now());
    DashboardLib.getTodayTasks(tasks, dayIndex);
  };
};
