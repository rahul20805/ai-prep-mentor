import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface WeeklyTimetable {
    tasks: Array<ScheduledTask>;
    weekStartTimestamp: Timestamp;
}
export interface DailyAccuracy {
    date: string;
    totalAttempts: bigint;
    accuracyPercent: bigint;
}
export interface AnalyticsSummary {
    dailyAccuracyLast7Days: Array<DailyAccuracy>;
    totalStudyHoursThisWeek: bigint;
    accuracyPerSubject: Array<[Subject, bigint]>;
    weeklyStudyMinutesPerDay: Array<[string, bigint]>;
}
export interface TodayTask {
    id: bigint;
    status: TaskStatus;
    topic: string;
    subject: Subject;
    estimatedMinutes: bigint;
}
export interface DashboardStats {
    totalStudyHoursThisWeek: bigint;
    todayCompletionPercent: bigint;
    weakSubjects: Array<Subject>;
    overallAccuracyPercent: bigint;
}
export interface LectureCard {
    id: string;
    title: string;
    duration: string;
    channelTitle: string;
    thumbnailUrl: string;
    description: string;
    viewCount: string;
    videoUrl: string;
}
export interface SubjectAccuracy {
    subject: Subject;
    correctAttempts: bigint;
    totalAttempts: bigint;
    accuracyPercent: bigint;
}
export interface ChatMessage {
    id: bigint;
    content: string;
    role: MessageRole;
    timestamp: Timestamp;
}
export interface ScheduledTask {
    id: bigint;
    status: TaskStatus;
    topic: string;
    subject: Subject;
    priority: Priority;
    dayIndex: bigint;
    rescheduledFromDay?: bigint;
    estimatedMinutes: bigint;
}
export interface Question {
    id: bigint;
    topic: string;
    subject: Subject;
    difficulty: Difficulty;
    year: bigint;
    questionText: string;
    correctOptionIndex: bigint;
    options: Array<string>;
}
export type Subject = string;
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum MessageRole {
    mentor = "mentor",
    user = "user"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum TaskStatus {
    pending = "pending",
    skipped = "skipped",
    completed = "completed"
}
export interface backendInterface {
    clearChatHistory(): Promise<void>;
    getAdminConfig(): Promise<{
        groqConfigured: boolean;
        youtubeConfigured: boolean;
    }>;
    getAnalyticsSummary(): Promise<AnalyticsSummary>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getDashboardStats(): Promise<DashboardStats>;
    getLectureCards(subject: string, searchQuery: string | null): Promise<Array<LectureCard>>;
    getSubjectAccuracy(): Promise<Array<SubjectAccuracy>>;
    getTodayTasks(): Promise<Array<TodayTask>>;
    getWeeklyTimetable(): Promise<WeeklyTimetable>;
    listQuestions(subject: Subject | null, difficulty: Difficulty | null): Promise<Array<Question>>;
    markTask(taskId: bigint, status: TaskStatus): Promise<boolean>;
    rescheduleSkipped(): Promise<void>;
    sendChatMessage(text: string): Promise<Array<ChatMessage>>;
    setGroqApiKey(key: string): Promise<boolean>;
    setYoutubeApiKey(key: string): Promise<boolean>;
    submitAnswer(questionId: bigint, selectedOptionIndex: bigint): Promise<boolean>;
}
