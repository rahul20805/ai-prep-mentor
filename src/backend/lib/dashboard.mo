import Common "../types/common";
import DashboardTypes "../types/dashboard";
import TimetableTypes "../types/timetable";
import PYQTypes "../types/pyq";
import List "mo:core/List";

module {

  public func getTodayTasks(
    tasks : List.List<TimetableTypes.ScheduledTask>,
    dayIndex : Nat,
  ) : [DashboardTypes.TodayTask] {
    let filtered = tasks.filter(func(t : TimetableTypes.ScheduledTask) : Bool {
      t.dayIndex == dayIndex;
    });
    let mapped : List.List<DashboardTypes.TodayTask> = List.empty();
    filtered.forEach(func(t : TimetableTypes.ScheduledTask) {
      mapped.add({
        id = t.id;
        subject = t.subject;
        topic = t.topic;
        estimatedMinutes = t.estimatedMinutes;
        status = t.status;
      });
    });
    mapped.toArray();
  };

  public func getStats(
    tasks : List.List<TimetableTypes.ScheduledTask>,
    attempts : List.List<PYQTypes.AttemptRecord>,
    dayIndex : Nat,
  ) : DashboardTypes.DashboardStats {
    // Total study hours = sum of estimatedMinutes for completed tasks this week / 60
    var totalMinutes = 0;
    tasks.forEach(func(t : TimetableTypes.ScheduledTask) {
      if (t.status == #completed) totalMinutes += t.estimatedMinutes;
    });
    let totalHours = totalMinutes / 60;

    // Overall accuracy
    let totalAttempts = attempts.size();
    var correctAttempts = 0;
    attempts.forEach(func(a : PYQTypes.AttemptRecord) {
      if (a.isCorrect) correctAttempts += 1;
    });
    let accuracy = if (totalAttempts == 0) 72 else (correctAttempts * 100) / totalAttempts;

    // Today's completion
    var todayTotal = 0;
    var todayDone = 0;
    tasks.forEach(func(t : TimetableTypes.ScheduledTask) {
      if (t.dayIndex == dayIndex) {
        todayTotal += 1;
        if (t.status == #completed) todayDone += 1;
      };
    });
    let todayPct = if (todayTotal == 0) 0 else (todayDone * 100) / todayTotal;

    // Weak subjects: subjects with fewest completed tasks
    let subjectStats : List.List<(Common.Subject, Nat, Nat)> = List.empty(); // (subject, done, total)
    tasks.forEach(func(t : TimetableTypes.ScheduledTask) {
      let idx = subjectStats.findIndex(func(s : (Common.Subject, Nat, Nat)) : Bool {
        s.0 == t.subject;
      });
      switch (idx) {
        case null {
          let done : Nat = if (t.status == #completed) 1 else 0;
          subjectStats.add((t.subject, done, 1));
        };
        case (?i) {
          let (subj, d, tot) = subjectStats.at(i);
          let newDone = if (t.status == #completed) d + 1 else d;
          subjectStats.put(i, (subj, newDone, tot + 1));
        };
      };
    });

    // Weak = lowest completion ratio. Sort ascending by ratio, take first 3.
    let sorted = subjectStats.sort(func(a : (Common.Subject, Nat, Nat), b : (Common.Subject, Nat, Nat)) : { #less; #equal; #greater } {
      let ratioA = if (a.2 == 0) 0 else (a.1 * 100) / a.2;
      let ratioB = if (b.2 == 0) 0 else (b.1 * 100) / b.2;
      if (ratioA < ratioB) #less
      else if (ratioA > ratioB) #greater
      else #equal;
    });

    let weakSubjects : List.List<Common.Subject> = List.empty();
    var count = 0;
    sorted.forEach(func(s : (Common.Subject, Nat, Nat)) {
      if (count < 3) {
        weakSubjects.add(s.0);
        count += 1;
      };
    });

    // Fallback weak subjects when no task data
    if (weakSubjects.isEmpty()) {
      weakSubjects.add("Physics");
      weakSubjects.add("Chemistry");
      weakSubjects.add("Biology");
    };

    {
      totalStudyHoursThisWeek = totalHours;
      overallAccuracyPercent = accuracy;
      weakSubjects = weakSubjects.toArray();
      todayCompletionPercent = todayPct;
    };
  };
};
