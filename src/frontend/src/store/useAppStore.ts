import { create } from "zustand";
import {
  dummyChatMessages,
  dummyDashboardStats,
  dummyQuestions,
  dummyScheduledTasks,
  dummyTodayTasks,
} from "../data/dummyData";
import { TaskStatus } from "../types";
import type {
  ChatMessage,
  DashboardStats,
  Difficulty,
  MessageRole,
  Question,
  ScheduledTask,
  Subject,
  TodayTask,
} from "../types";

// ─── PYQ Attempt State ────────────────────────────────────────────────────────

type QuizAttempt = {
  questionId: bigint;
  selectedOption: number;
  isCorrect: boolean;
};

// ─── Store Shape ──────────────────────────────────────────────────────────────

type AppState = {
  // Timetable
  scheduledTasks: ScheduledTask[];
  todayTasks: TodayTask[];
  markTodayTask: (id: bigint, status: TaskStatus) => void;
  markScheduledTask: (id: bigint, status: TaskStatus) => void;
  rescheduleSkipped: () => void;

  // PYQ / Practice
  questions: Question[];
  attempts: Record<string, QuizAttempt>;
  currentSubjectFilter: Subject | null;
  currentDifficultyFilter: Difficulty | null;
  setSubjectFilter: (subject: Subject | null) => void;
  setDifficultyFilter: (difficulty: Difficulty | null) => void;
  submitAttempt: (
    questionId: bigint,
    selectedOption: number,
    isCorrect: boolean,
  ) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (content: string, role: MessageRole) => void;
  clearChat: () => void;

  // Dashboard stats
  dashboardStats: DashboardStats;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // ── Timetable ──────────────────────────────────────────────────────────────
  scheduledTasks: dummyScheduledTasks,
  todayTasks: dummyTodayTasks,

  markTodayTask: (id, status) =>
    set((state) => ({
      todayTasks: state.todayTasks.map((t) =>
        t.id === id ? { ...t, status } : t,
      ),
    })),

  markScheduledTask: (id, status) =>
    set((state) => ({
      scheduledTasks: state.scheduledTasks.map((t) =>
        t.id === id ? { ...t, status } : t,
      ),
    })),

  rescheduleSkipped: () =>
    set((state) => {
      // Find first future day index that has fewer than 6 tasks
      const todayIndex = 4; // Friday
      const tasksByDay: Record<number, ScheduledTask[]> = {};
      for (let i = 0; i < 7; i++) tasksByDay[i] = [];
      for (const t of state.scheduledTasks) {
        tasksByDay[Number(t.dayIndex)].push(t);
      }

      const skipped = state.scheduledTasks.filter(
        (t) => t.status === TaskStatus.skipped,
      );
      if (skipped.length === 0) return {};

      const updated = [...state.scheduledTasks];
      for (const task of skipped) {
        // Find next available day after today (or after current day)
        const currentDay = Number(task.dayIndex);
        let placed = false;
        for (let d = Math.max(currentDay + 1, todayIndex); d < 7; d++) {
          if (tasksByDay[d].length < 6) {
            const idx = updated.findIndex((t) => t.id === task.id);
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                dayIndex: BigInt(d),
                status: TaskStatus.pending,
                rescheduledFromDay: task.dayIndex,
              };
              tasksByDay[d].push(updated[idx]);
            }
            placed = true;
            break;
          }
        }
        // If no future slot found, keep as skipped
        if (!placed) {
          // do nothing — task stays skipped
          void currentDay;
        }
      }
      return { scheduledTasks: updated };
    }),

  // ── Practice ───────────────────────────────────────────────────────────────
  questions: dummyQuestions,
  attempts: {},
  currentSubjectFilter: null,
  currentDifficultyFilter: null,

  setSubjectFilter: (subject) => set({ currentSubjectFilter: subject }),
  setDifficultyFilter: (difficulty) =>
    set({ currentDifficultyFilter: difficulty }),

  submitAttempt: (questionId, selectedOption, isCorrect) =>
    set((state) => ({
      attempts: {
        ...state.attempts,
        [questionId.toString()]: { questionId, selectedOption, isCorrect },
      },
    })),

  // ── Chat ───────────────────────────────────────────────────────────────────
  chatMessages: dummyChatMessages,

  addChatMessage: (content, role) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: BigInt(Date.now()),
          content,
          role,
          timestamp: BigInt(Date.now()),
        },
      ],
    })),

  clearChat: () => set({ chatMessages: [] }),

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboardStats: dummyDashboardStats,
}));
