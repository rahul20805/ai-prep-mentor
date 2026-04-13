import Common "common";

module {
  public type Priority = { #low; #medium; #high };

  public type ScheduledTask = {
    id : Nat;
    dayIndex : Nat; // 0 = Mon … 6 = Sun
    subject : Common.Subject;
    topic : Text;
    estimatedMinutes : Nat;
    priority : Priority;
    status : Common.TaskStatus;
    rescheduledFromDay : ?Nat; // set when auto-rescheduled
  };

  public type WeeklyTimetable = {
    weekStartTimestamp : Common.Timestamp;
    tasks : [ScheduledTask];
  };
};
