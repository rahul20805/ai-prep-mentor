import Common "common";

module {
  public type DailyAccuracy = {
    date : Text; // "YYYY-MM-DD"
    accuracyPercent : Nat;
    totalAttempts : Nat;
  };

  public type AnalyticsSummary = {
    dailyAccuracyLast7Days : [DailyAccuracy];
    accuracyPerSubject : [(Common.Subject, Nat)]; // subject -> accuracy %
    totalStudyHoursThisWeek : Nat;
    weeklyStudyMinutesPerDay : [(Text, Nat)]; // day label -> minutes
  };
};
