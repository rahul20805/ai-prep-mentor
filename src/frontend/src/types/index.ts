// Re-export types from backend for convenience
export type {
  Subject,
  TodayTask,
  ScheduledTask,
  Question,
  SubjectAccuracy,
  DailyAccuracy,
  AnalyticsSummary,
  DashboardStats,
  ChatMessage,
  WeeklyTimetable,
  LectureCard,
} from "../backend";

export {
  TaskStatus,
  Difficulty,
  Priority,
  MessageRole,
} from "../backend";

// Additional frontend-only types
export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
};

export type QuizAttempt = {
  questionId: bigint;
  selectedOption: number;
  isCorrect: boolean;
  answeredAt: number;
};

export type AppTab =
  | "dashboard"
  | "timetable"
  | "practice"
  | "analytics"
  | "mentor"
  | "lectures";
