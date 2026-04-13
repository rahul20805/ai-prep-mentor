import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  RotateCcw,
  SkipForward,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useGetWeeklyTimetable,
  useMarkTask,
  useRescheduleSkipped,
} from "../hooks/useBackend";
import { Priority, TaskStatus } from "../types";
import type { ScheduledTask } from "../types";

// ─── Config ───────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0 … Sun=6

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Physics: {
    bg: "bg-chart-2/10 border-chart-2/25",
    text: "text-chart-2",
    dot: "bg-chart-2",
  },
  Chemistry: {
    bg: "bg-chart-3/10 border-chart-3/25",
    text: "text-chart-3",
    dot: "bg-chart-3",
  },
  Biology: {
    bg: "bg-chart-5/10 border-chart-5/25",
    text: "text-chart-5",
    dot: "bg-chart-5",
  },
  Mathematics: {
    bg: "bg-chart-1/10 border-chart-1/25",
    text: "text-chart-1",
    dot: "bg-chart-1",
  },
  "All Subjects": {
    bg: "bg-primary/10 border-primary/25",
    text: "text-primary",
    dot: "bg-primary",
  },
};

const SUBJECT_FALLBACK = {
  bg: "bg-muted border-border",
  text: "text-muted-foreground",
  dot: "bg-muted-foreground",
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  [Priority.high]: {
    label: "High",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  [Priority.medium]: {
    label: "Med",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  [Priority.low]: {
    label: "Low",
    color: "bg-muted text-muted-foreground border-border",
  },
};

// ─── TaskRow ──────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onMark,
}: {
  task: ScheduledTask;
  onMark: (id: bigint, s: TaskStatus) => void;
}) {
  const color = SUBJECT_COLORS[task.subject] ?? SUBJECT_FALLBACK;
  const isCompleted = task.status === TaskStatus.completed;
  const isSkipped = task.status === TaskStatus.skipped;
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg border transition-smooth group
        ${isCompleted ? "bg-muted/20 opacity-55" : isSkipped ? "bg-destructive/3 border-destructive/10 opacity-45" : "bg-card hover:shadow-xs border-border"}`}
      data-ocid="timetable-task-row"
    >
      {/* Complete toggle */}
      <button
        type="button"
        aria-label={isCompleted ? "Unmark complete" : "Mark complete"}
        onClick={() =>
          onMark(
            task.id,
            isCompleted ? TaskStatus.pending : TaskStatus.completed,
          )
        }
        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-smooth
          ${isCompleted ? "bg-accent border-accent" : "border-muted-foreground/40 hover:border-accent group-hover:border-accent/60"}`}
        data-ocid="task-complete-toggle"
      >
        {isCompleted && (
          <CheckCircle2 size={9} className="text-accent-foreground" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[11px] font-medium leading-tight truncate
            ${isCompleted || isSkipped ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {task.topic}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span
            className={`text-[10px] px-1.5 py-px rounded border font-medium ${color.bg} ${color.text}`}
          >
            {task.subject === "All Subjects" ? "All" : task.subject.slice(0, 4)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock size={8} />
            {Number(task.estimatedMinutes)}m
          </span>
          {task.rescheduledFromDay !== undefined && (
            <span className="text-[9px] px-1 py-px rounded border border-accent/30 text-accent bg-accent/5">
              ↻ moved
            </span>
          )}
        </div>
      </div>

      {/* Priority */}
      <span
        className={`text-[9px] px-1 py-px rounded border flex-shrink-0 mt-0.5 ${priorityCfg.color}`}
      >
        {priorityCfg.label}
      </span>

      {/* Actions */}
      {task.status === TaskStatus.pending && (
        <button
          type="button"
          title="Skip task"
          aria-label="Skip task"
          onClick={() => onMark(task.id, TaskStatus.skipped)}
          className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-smooth"
          data-ocid="task-skip-btn"
        >
          <SkipForward size={11} />
        </button>
      )}
      {isSkipped && (
        <button
          type="button"
          title="Restore task"
          aria-label="Restore task"
          onClick={() => onMark(task.id, TaskStatus.pending)}
          className="flex-shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-smooth"
          data-ocid="task-restore-btn"
        >
          <RotateCcw size={11} />
        </button>
      )}
    </motion.div>
  );
}

// ─── DayColumn ────────────────────────────────────────────────────────────────

function DayColumn({
  dayShort,
  tasks,
  onMark,
  isToday,
  isPast,
}: {
  dayShort: string;
  tasks: ScheduledTask[];
  onMark: (id: bigint, s: TaskStatus) => void;
  isToday: boolean;
  isPast: boolean;
}) {
  const completed = tasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;
  const skipped = tasks.filter((t) => t.status === TaskStatus.skipped).length;
  const total = tasks.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalMin = tasks.reduce((a, t) => a + Number(t.estimatedMinutes), 0);

  return (
    <div
      className={`flex flex-col rounded-xl border transition-smooth overflow-hidden
        ${isToday ? "border-accent/50 ring-1 ring-accent/20" : "border-border"}
        ${isPast && !isToday ? "opacity-80" : ""}`}
    >
      {/* Day header */}
      <div
        className={`px-3 py-2.5 border-b flex-shrink-0
          ${isToday ? "bg-accent/10 border-accent/30" : "bg-muted/30 border-border"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-[11px] font-bold ${isToday ? "text-accent" : "text-foreground"}`}
            >
              {dayShort}
              {isToday && (
                <span className="ml-1.5 text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-semibold">
                  TODAY
                </span>
              )}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {totalMin}m · {completed}/{total}
            </p>
          </div>
          <Calendar
            size={11}
            className={isToday ? "text-accent" : "text-muted-foreground"}
          />
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isToday ? "bg-accent" : "bg-primary/60"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {/* Tasks */}
      <div
        className={`p-2 space-y-1.5 flex-1 min-h-[100px] ${isToday ? "bg-accent/3" : "bg-card"}`}
      >
        {tasks.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center pt-5 leading-relaxed">
            Rest day 🎉<br />
            <span className="text-[9px]">No tasks</span>
          </p>
        ) : (
          tasks.map((task) => (
            <TaskRow key={task.id.toString()} task={task} onMark={onMark} />
          ))
        )}
      </div>

      {/* Footer summary */}
      {total > 0 && (
        <div
          className={`px-2.5 py-1.5 border-t text-[9px] text-muted-foreground flex items-center justify-between
          ${isToday ? "border-accent/20 bg-accent/5" : "border-border bg-muted/10"}`}
        >
          <span className="text-chart-5">{completed} done</span>
          {skipped > 0 && (
            <span className="text-destructive/70">{skipped} skipped</span>
          )}
          <span>{progressPct}%</span>
        </div>
      )}
    </div>
  );
}

// ─── WeekStat ─────────────────────────────────────────────────────────────────

function WeekStat({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${accent ? "bg-accent/8 border-accent/25" : "bg-card border-border"}`}
    >
      <div className={`${accent ? "text-accent" : "text-primary"}`}>{icon}</div>
      <div>
        <p
          className={`text-lg font-bold font-display leading-none ${accent ? "text-accent" : "text-foreground"}`}
        >
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const { data: weeklyTimetable, isLoading, isError } = useGetWeeklyTimetable();
  const markTask = useMarkTask();
  const rescheduleSkipped = useRescheduleSkipped();
  const [isRescheduling, setIsRescheduling] = useState(false);

  const scheduledTasks = weeklyTimetable?.tasks ?? [];

  const tasksByDay = DAYS.map((_, i) =>
    scheduledTasks.filter((t) => Number(t.dayIndex) === i),
  );

  const totalTasks = scheduledTasks.length;
  const completedTasks = scheduledTasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;
  const skippedTasks = scheduledTasks.filter(
    (t) => t.status === TaskStatus.skipped,
  ).length;
  const totalMinutes = scheduledTasks.reduce(
    (a, t) => a + Number(t.estimatedMinutes),
    0,
  );
  const weekProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleMarkTask = (id: bigint, status: TaskStatus) => {
    markTask.mutate({ taskId: id, status });
  };

  function handleReschedule() {
    setIsRescheduling(true);
    rescheduleSkipped.mutate(undefined, {
      onSettled: () => setIsRescheduling(false),
    });
  }

  // Calculate week label from weekStartTimestamp
  const weekStart = weeklyTimetable?.weekStartTimestamp
    ? new Date(Number(weeklyTimetable.weekStartTimestamp) / 1_000_000)
    : new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const fmtOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const weekLabel = `${weekStart.toLocaleDateString("en-US", fmtOpts)} – ${weekEnd.toLocaleDateString("en-US", fmtOpts)}, ${weekStart.getFullYear()}`;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-accent" />
            Weekly Timetable
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{weekLabel}</p>
        </div>

        {skippedTasks > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1.5 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
            onClick={handleReschedule}
            disabled={isRescheduling}
            data-ocid="reschedule-btn"
          >
            <RefreshCw
              size={12}
              className={isRescheduling ? "animate-spin" : ""}
            />
            Auto-reschedule {skippedTasks} skipped
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-2"
          data-ocid="timetable-error"
        >
          <p className="font-semibold text-foreground">
            Couldn't load your timetable
          </p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page to try again.
          </p>
        </div>
      ) : (
        <>
          {/* Week stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WeekStat
              icon={<Zap size={16} />}
              value={`${weekProgress}%`}
              label="Week complete"
              accent
            />
            <WeekStat
              icon={<CheckCircle2 size={16} />}
              value={`${completedTasks}/${totalTasks}`}
              label="Tasks done"
            />
            <WeekStat
              icon={<Clock size={16} />}
              value={`${Math.round(totalMinutes / 60)}h`}
              label="Total study time"
            />
            <WeekStat
              icon={<SkipForward size={16} />}
              value={skippedTasks}
              label="Skipped tasks"
            />
          </motion.div>

          {/* Week progress bar */}
          <Card className="border-border">
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground">
                  Overall Weekly Progress
                </p>
                <p className="text-xs font-bold text-accent">{weekProgress}%</p>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${weekProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {Object.entries(SUBJECT_COLORS)
                  .slice(0, 4)
                  .map(([subj, col]) => (
                    <div key={subj} className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                      <span className="text-[10px] text-muted-foreground">
                        {subj}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Day grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS.map((dayShort, i) => (
              <motion.div
                key={dayShort}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <DayColumn
                  dayShort={dayShort}
                  tasks={tasksByDay[i]}
                  onMark={handleMarkTask}
                  isToday={i === TODAY_INDEX}
                  isPast={i < TODAY_INDEX}
                />
              </motion.div>
            ))}
          </div>

          {/* Priority legend */}
          <div className="flex items-center gap-5 flex-wrap pt-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Priority:
            </span>
            {Object.entries(PRIORITY_CONFIG).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[9px] h-4 px-1.5 ${cfg.color}`}
                >
                  {cfg.label}
                </Badge>
              </div>
            ))}
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide ml-4">
              Subject:
            </span>
            {Object.entries(SUBJECT_COLORS)
              .slice(0, 4)
              .map(([subj, col]) => (
                <div key={subj} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-sm ${col.dot}`} />
                  <span className="text-[10px] text-muted-foreground">
                    {subj}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
