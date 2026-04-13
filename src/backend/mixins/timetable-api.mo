import TimetableLib "../lib/timetable";
import TimetableTypes "../types/timetable";
import Common "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

mixin (
  // Per-user tasks: Map<Principal, List<ScheduledTask>>
  userScheduledTasks : Map.Map<Principal, List.List<TimetableTypes.ScheduledTask>>,
  // Per-user task ID counter
  userTaskIds : Map.Map<Principal, Nat>,
) {
  func timetableGetTasks(caller : Principal) : List.List<TimetableTypes.ScheduledTask> {
    switch (userScheduledTasks.get(caller)) {
      case (?tasks) tasks;
      case null {
        let tasks = List.empty<TimetableTypes.ScheduledTask>();
        userScheduledTasks.add(caller, tasks);
        tasks;
      };
    };
  };

  func timetableGetNextId(caller : Principal) : Nat {
    switch (userTaskIds.get(caller)) {
      case (?n) n;
      case null 0;
    };
  };

  public shared ({ caller }) func getWeeklyTimetable() : async TimetableTypes.WeeklyTimetable {
    let tasks = timetableGetTasks(caller);
    let nextId = timetableGetNextId(caller);
    let newId = TimetableLib.seed(tasks, nextId);
    userTaskIds.add(caller, newId);
    TimetableLib.getWeeklyTimetable(tasks);
  };

  public shared ({ caller }) func markTask(taskId : Nat, status : Common.TaskStatus) : async Bool {
    let tasks = timetableGetTasks(caller);
    TimetableLib.markTask(tasks, taskId, status);
  };

  public shared ({ caller }) func rescheduleSkipped() : async () {
    let tasks = timetableGetTasks(caller);
    let nextId = timetableGetNextId(caller);
    let newId = TimetableLib.rescheduleSkipped(tasks, nextId);
    userTaskIds.add(caller, newId);
  };
};
