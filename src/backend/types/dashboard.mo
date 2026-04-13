import Common "common";

module {
  public type DashboardStats = {
    totalStudyHoursThisWeek : Nat;
    overallAccuracyPercent : Nat;
    weakSubjects : [Common.Subject];
    todayCompletionPercent : Nat;
  };

  public type TodayTask = {
    id : Nat;
    subject : Common.Subject;
    topic : Text;
    estimatedMinutes : Nat;
    status : Common.TaskStatus;
  };
};
