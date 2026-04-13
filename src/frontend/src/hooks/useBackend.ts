import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AnalyticsSummary,
  ChatMessage,
  DashboardStats,
  Difficulty,
  LectureCard,
  Subject,
  SubjectAccuracy,
  TaskStatus,
  TodayTask,
  WeeklyTimetable,
} from "../types";

// ─── Actor wrapper ────────────────────────────────────────────────────────────

function useBackendActor() {
  return useActor(createActor);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTodayTasks() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<TodayTask[]>({
    queryKey: ["todayTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Timetable ────────────────────────────────────────────────────────────────

export function useGetWeeklyTimetable() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<WeeklyTimetable>({
    queryKey: ["weeklyTimetable"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getWeeklyTimetable();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkTask() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: { taskId: bigint; status: TaskStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markTask(taskId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayTasks"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyTimetable"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useRescheduleSkipped() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rescheduleSkipped();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyTimetable"] });
    },
  });
}

// ─── Practice ────────────────────────────────────────────────────────────────

export function useListQuestions(
  subject: Subject | null,
  difficulty: Difficulty | null,
) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["questions", subject, difficulty],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listQuestions(subject, difficulty);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitAnswer() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      selectedOptionIndex,
    }: { questionId: bigint; selectedOptionIndex: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitAnswer(questionId, selectedOptionIndex);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjectAccuracy"] });
    },
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useGetAnalyticsSummary() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<AnalyticsSummary>({
    queryKey: ["analyticsSummary"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getAnalyticsSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSubjectAccuracy() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<SubjectAccuracy[]>({
    queryKey: ["subjectAccuracy"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjectAccuracy();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mentor Chat ─────────────────────────────────────────────────────────────

export function useGetChatHistory() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendChatMessage() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.sendChatMessage(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useClearChatHistory() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.clearChatHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

// ─── Admin Config ─────────────────────────────────────────────────────────────

export function useGetAdminConfig() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<{ groqConfigured: boolean; youtubeConfigured: boolean }>({
    queryKey: ["adminConfig"],
    queryFn: async () => {
      if (!actor) return { groqConfigured: false, youtubeConfigured: false };
      return actor.getAdminConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetGroqApiKey() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setGroqApiKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] });
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useSetYoutubeApiKey() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setYoutubeApiKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] });
      queryClient.invalidateQueries({ queryKey: ["lectureCards"] });
    },
  });
}

// ─── Lectures ────────────────────────────────────────────────────────────────

export function useGetLectureCards(subject: string, searchQuery?: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<LectureCard[]>({
    queryKey: ["lectureCards", subject, searchQuery ?? ""],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLectureCards(subject, searchQuery ?? null);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes — YouTube data doesn't change often
  });
}
