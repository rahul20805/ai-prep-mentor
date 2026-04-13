import TimetableTypes "../types/timetable";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // ── Seed data ────────────────────────────────────────────────────────────

  type Task = TimetableTypes.ScheduledTask;

  let SEED_TASKS : [(Nat, Common.Subject, Text, Nat, TimetableTypes.Priority)] = [
    // Day 0 – Monday
    (0, "Physics",   "Newton's Laws of Motion",        60, #high),
    (0, "Chemistry", "Periodic Table Trends",           45, #medium),
    (0, "Biology",   "Cell Division – Mitosis",         50, #high),
    (0, "Physics",   "Work, Energy & Power",            45, #medium),
    (0, "Chemistry", "Chemical Bonding",                40, #low),
    (0, "Biology",   "Human Digestive System",          40, #low),

    // Day 1 – Tuesday
    (1, "Physics",   "Kinematics & Projectile Motion", 60, #high),
    (1, "Chemistry", "Electrochemistry",                50, #high),
    (1, "Biology",   "Photosynthesis",                  45, #medium),
    (1, "Physics",   "Circular Motion",                 40, #medium),
    (1, "Chemistry", "Coordination Compounds",          40, #low),
    (1, "Biology",   "Respiration in Plants",           35, #low),

    // Day 2 – Wednesday
    (2, "Physics",   "Gravitation",                     55, #high),
    (2, "Chemistry", "Organic Chemistry – Isomerism",   50, #high),
    (2, "Biology",   "Genetics & Mendelian Laws",       60, #high),
    (2, "Physics",   "Fluid Mechanics",                 40, #medium),
    (2, "Chemistry", "Thermodynamics",                  45, #medium),
    (2, "Biology",   "Nervous System",                  35, #low),

    // Day 3 – Thursday
    (3, "Physics",   "Thermodynamics",                  55, #high),
    (3, "Chemistry", "Aldehyde & Ketones",              50, #high),
    (3, "Biology",   "DNA Replication",                 50, #high),
    (3, "Physics",   "Waves & Sound",                   40, #medium),
    (3, "Chemistry", "Solutions & Colligative Props",   40, #medium),
    (3, "Biology",   "Endocrine System",                35, #low),

    // Day 4 – Friday
    (4, "Physics",   "Electrostatics",                  60, #high),
    (4, "Chemistry", "Carboxylic Acids & Derivatives",  50, #high),
    (4, "Biology",   "Evolution",                       45, #medium),
    (4, "Physics",   "Current Electricity",             45, #medium),
    (4, "Chemistry", "Surface Chemistry",               35, #low),
    (4, "Biology",   "Excretory System",                35, #low),

    // Day 5 – Saturday
    (5, "Physics",   "Magnetic Effects of Current",     55, #high),
    (5, "Chemistry", "Amines",                          45, #high),
    (5, "Biology",   "Biotechnology",                   50, #medium),
    (5, "Physics",   "Electromagnetic Induction",       45, #medium),
    (5, "Chemistry", "p-Block Elements",                40, #low),
    (5, "Biology",   "Ecosystem & Biodiversity",        35, #low),

    // Day 6 – Sunday (revision / lighter load)
    (6, "Physics",   "Optics – Ray Optics",             50, #medium),
    (6, "Chemistry", "d and f Block Elements",          45, #medium),
    (6, "Biology",   "Human Reproduction",              45, #medium),
    (6, "Physics",   "Dual Nature of Radiation",        40, #low),
    (6, "Chemistry", "Biomolecules",                    35, #low),
  ];

  public func seed(tasks : List.List<Task>, nextId : Nat) : Nat {
    if (not tasks.isEmpty()) return nextId;
    var id = nextId;
    for ((day, subj, topic, mins, prio) in SEED_TASKS.values()) {
      tasks.add({
        id = id;
        dayIndex = day;
        subject = subj;
        topic = topic;
        estimatedMinutes = mins;
        priority = prio;
        status = #pending;
        rescheduledFromDay = null;
      });
      id += 1;
    };
    id;
  };

  // ── Queries ───────────────────────────────────────────────────────────────

  public func getWeeklyTimetable(tasks : List.List<Task>) : TimetableTypes.WeeklyTimetable {
    {
      weekStartTimestamp = Time.now();
      tasks = tasks.toArray();
    };
  };

  // ── Mutations ─────────────────────────────────────────────────────────────

  public func markTask(
    tasks : List.List<Task>,
    taskId : Nat,
    status : Common.TaskStatus,
  ) : Bool {
    var found = false;
    tasks.mapInPlace(func(t : Task) : Task {
      if (t.id == taskId) {
        found := true;
        { t with status = status };
      } else { t };
    });
    found;
  };

  /// Find next day index (starting after fromDay) with fewer than maxTasks tasks.
  func findNextAvailableDay(dayCounts : [var Nat], fromDay : Nat, maxTasks : Nat) : ?Nat {
    var d = (fromDay + 1) % 7;
    var i = 0;
    var result : ?Nat = null;
    while (i < 7 and result == null) {
      if (dayCounts[d] < maxTasks) {
        result := ?d;
      } else {
        d := (d + 1) % 7;
        i += 1;
      };
    };
    result;
  };

  /// Move all skipped tasks to the next day that has fewer than 7 tasks scheduled.
  public func rescheduleSkipped(tasks : List.List<Task>, nextId : Nat) : Nat {
    // Build count of tasks per day
    let dayCounts : [var Nat] = [var 0, 0, 0, 0, 0, 0, 0];
    tasks.forEach(func(t : Task) {
      if (t.dayIndex < 7) {
        dayCounts[t.dayIndex] += 1;
      };
    });

    var id = nextId;
    let toReschedule = tasks.filter(func(t : Task) : Bool { t.status == #skipped });
    toReschedule.forEach(func(skipped : Task) {
      switch (findNextAvailableDay(dayCounts, skipped.dayIndex, 7)) {
        case (?day) {
          tasks.add({
            id = id;
            dayIndex = day;
            subject = skipped.subject;
            topic = skipped.topic;
            estimatedMinutes = skipped.estimatedMinutes;
            priority = skipped.priority;
            status = #pending;
            rescheduledFromDay = ?skipped.dayIndex;
          });
          dayCounts[day] += 1;
          id += 1;
        };
        case null {};
      };
    });
    id;
  };
};
