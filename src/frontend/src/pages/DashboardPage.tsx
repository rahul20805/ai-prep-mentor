import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import {
  useGetDashboardStats,
  useGetSubjectAccuracy,
  useGetTodayTasks,
  useMarkTask,
} from "../hooks/useBackend";
import { TaskStatus } from "../types";
import type { TodayTask } from "../types";

// ─── Subject color map ────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  Chemistry: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Biology: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  Mathematics: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  "All Subjects": "bg-primary/15 text-primary border-primary/30",
};

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function ProgressRing({
  value,
  size = 120,
  stroke = 10,
}: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-label={`${value}% complete`}
        role="img"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-foreground leading-none">
          {value}%
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
          Today
        </span>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onMark,
}: { task: TodayTask; onMark: (id: bigint, s: TaskStatus) => void }) {
  const colorClass =
    SUBJECT_COLORS[task.subject] ??
    "bg-muted text-muted-foreground border-border";
  const isPending = task.status === TaskStatus.pending;
  const isCompleted = task.status === TaskStatus.completed;
  const isSkipped = task.status === TaskStatus.skipped;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-smooth
        ${isCompleted ? "bg-muted/40 opacity-70" : isSkipped ? "bg-muted/20 opacity-50" : "bg-card hover:shadow-xs"}`}
      data-ocid="today-task-row"
    >
      <button
        type="button"
        aria-label={isCompleted ? "Mark pending" : "Mark complete"}
        onClick={() =>
          onMark(
            task.id,
            isCompleted ? TaskStatus.pending : TaskStatus.completed,
          )
        }
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-smooth
          ${isCompleted ? "bg-accent border-accent text-accent-foreground" : "border-border hover:border-accent"}`}
      >
        {isCompleted && <CheckCircle2 size={12} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${isCompleted || isSkipped ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {task.topic}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass}`}
          >
            {task.subject}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={11} /> {Number(task.estimatedMinutes)} min
          </span>
        </div>
      </div>

      {isPending && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-destructive px-2 flex-shrink-0"
          onClick={() => onMark(task.id, TaskStatus.skipped)}
          aria-label="Skip task"
        >
          Skip
        </Button>
      )}
      {isSkipped && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 flex-shrink-0"
          onClick={() => onMark(task.id, TaskStatus.pending)}
          aria-label="Restore task"
        >
          <RotateCcw size={12} />
        </Button>
      )}
    </div>
  );
}

// ─── Inline error notice ──────────────────────────────────────────────────────

function InlineError({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive/80 flex items-center gap-2"
      data-ocid="inline-error"
    >
      <AlertTriangle size={14} className="flex-shrink-0" />
      {message}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetDashboardStats();
  const {
    data: todayTasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTodayTasks();
  const {
    data: subjectAccuracy = [],
    isLoading: accuracyLoading,
    isError: accuracyError,
  } = useGetSubjectAccuracy();
  const markTask = useMarkTask();

  // Derive greeting name from principal (first 6 chars of principal ID)
  const principalId = identity?.getPrincipal().toText() ?? "";
  const shortId = principalId ? principalId.slice(0, 6) : "Student";

  const handleMarkTask = (id: bigint, status: TaskStatus) => {
    markTask.mutate({ taskId: id, status });
  };

  const completed = todayTasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;
  const pending = todayTasks.filter(
    (t) => t.status === TaskStatus.pending,
  ).length;
  const completionPct =
    todayTasks.length > 0
      ? Math.round((completed / todayTasks.length) * 100)
      : 0;

  const stats = [
    {
      label: "Study Hours",
      sub: "This week",
      value: dashboardStats
        ? `${Number(dashboardStats.totalStudyHoursThisWeek)}h`
        : "—",
      icon: <Clock size={16} />,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Overall Accuracy",
      sub: "All subjects",
      value: dashboardStats
        ? `${Number(dashboardStats.overallAccuracyPercent)}%`
        : "—",
      icon: <BookOpen size={16} />,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
  ];

  const quickActions = [
    {
      label: "Start Today's Plan",
      icon: <Play size={15} className="fill-current" />,
      to: "/timetable",
      variant: "default" as const,
      ocid: "cta-start-plan",
    },
    {
      label: "View Analytics",
      icon: <TrendingUp size={15} />,
      to: "/analytics",
      variant: "outline" as const,
      ocid: "cta-view-analytics",
    },
    {
      label: "Chat with Mentor",
      icon: <Bot size={15} />,
      to: "/mentor",
      variant: "outline" as const,
      ocid: "cta-chat-mentor",
    },
  ];

  const isLoading = statsLoading || tasksLoading;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* ── Hero section: greeting + progress ring + quick actions ── */}
      <div className="rounded-xl border bg-card p-5 lg:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Text + CTAs */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Good morning, {shortId}! 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading
                ? "Loading your tasks…"
                : pending > 0
                  ? `You have ${pending} task${pending > 1 ? "s" : ""} pending today. Keep the momentum going!`
                  : "All tasks done for today — outstanding work! 🎉"}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2" data-ocid="quick-actions">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <Button
                  variant={action.variant}
                  size="sm"
                  className="gap-1.5 text-xs font-medium"
                  data-ocid={action.ocid}
                >
                  {action.icon}
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <ProgressRing value={completionPct} size={120} stroke={10} />
          <p className="text-xs text-muted-foreground">
            {completed}/{todayTasks.length} tasks done
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      {statsError ? (
        <InlineError message="Couldn't load stats. Please refresh." />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border shadow-xs">
              <CardContent className="p-4">
                <div
                  className={`w-7 h-7 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2.5`}
                >
                  {stat.icon}
                </div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-16 mb-1" />
                ) : (
                  <p className="text-xl font-display font-bold text-foreground leading-none">
                    {stat.value}
                  </p>
                )}
                <p className="text-xs font-medium text-foreground mt-1">
                  {stat.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Main content: tasks + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's task list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">
              Today's Plan
            </h3>
            <span className="text-xs text-muted-foreground">
              {completed}/{todayTasks.length} done
            </span>
          </div>
          <Progress value={completionPct} className="h-1.5" />
          {tasksError ? (
            <InlineError message="Couldn't load tasks. Please refresh." />
          ) : tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id.toString()}
                  task={task}
                  onMark={handleMarkTask}
                />
              ))}
              {todayTasks.length === 0 && (
                <div
                  className="text-center py-10 text-muted-foreground text-sm"
                  data-ocid="tasks-empty-state"
                >
                  No tasks scheduled for today.
                </div>
              )}
            </div>
          )}
          <Link to="/timetable">
            <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
              View Full Timetable <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Weak areas */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={14} className="text-accent" />
                Weak Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {statsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : statsError ? (
                <p className="text-xs text-destructive/70">
                  Couldn't load weak areas.
                </p>
              ) : (
                (dashboardStats?.weakSubjects ?? []).map((sub) => (
                  <div key={sub} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{sub}</span>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-accent/10 text-accent border-accent/20"
                    >
                      Focus
                    </Badge>
                  </div>
                ))
              )}
              <Link to="/practice">
                <Button
                  size="sm"
                  className="w-full mt-2 text-xs"
                  variant="default"
                  data-ocid="weak-area-practice-cta"
                >
                  Practice Now <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Subject accuracy */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">
                Subject Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {accuracyLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : accuracyError ? (
                <p className="text-xs text-destructive/70">
                  Couldn't load accuracy.
                </p>
              ) : (
                subjectAccuracy.map((sub) => (
                  <div key={sub.subject} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {sub.subject}
                      </span>
                      <span className="font-medium text-foreground">
                        {Number(sub.accuracyPercent)}%
                      </span>
                    </div>
                    <Progress
                      value={Number(sub.accuracyPercent)}
                      className="h-1.5"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
