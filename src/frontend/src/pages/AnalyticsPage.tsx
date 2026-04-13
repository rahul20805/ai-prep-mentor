import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Minus,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetAnalyticsSummary,
  useGetSubjectAccuracy,
} from "../hooks/useBackend";

// ─── Chart colors via CSS variables (resolved at runtime) ─────────────────────

function getCssVar(name: string): string {
  if (typeof window === "undefined") return "#888";
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw ? `oklch(${raw})` : "#888";
}

const CHART_COLORS = {
  primary: () => getCssVar("--primary"),
  chart1: () => getCssVar("--chart-1"),
  chart2: () => getCssVar("--chart-2"),
  chart3: () => getCssVar("--chart-3"),
  chart5: () => getCssVar("--chart-5"),
  accent: () => getCssVar("--accent"),
  destructive: () => getCssVar("--destructive"),
  muted: () => getCssVar("--muted"),
  mutedFg: () => getCssVar("--muted-foreground"),
  border: () => getCssVar("--border"),
};

const SUBJECT_CHART_COLORS: Record<string, () => string> = {
  Physics: CHART_COLORS.chart2,
  Chemistry: CHART_COLORS.chart3,
  Biology: CHART_COLORS.chart5,
  Mathematics: CHART_COLORS.chart1,
};

const SUBJECT_BG: Record<string, string> = {
  Physics: "bg-primary/10 text-primary border-primary/25",
  Chemistry: "bg-chart-3/10 text-chart-3 border-chart-3/25",
  Biology: "bg-chart-5/10 text-chart-5 border-chart-5/25",
  Mathematics: "bg-accent/10 text-accent border-accent/25",
};

const tooltipStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: 12,
  padding: "6px 10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

// ─── Trend Badge ──────────────────────────────────────────────────────────────

type TrendBadgeProps = { current: number; previous: number };
function TrendBadge({ current, previous }: TrendBadgeProps) {
  const diff = current - previous;
  if (diff > 0)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-chart-5">
        <TrendingUp size={11} />+{diff}%
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown size={11} />
        {diff}%
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus size={11} />
      0%
    </span>
  );
}

// ─── Accuracy bar ─────────────────────────────────────────────────────────────

function AccuracyBar({ value }: { value: number }) {
  const color =
    value < 50 ? "bg-destructive" : value < 60 ? "bg-accent" : "bg-chart-5";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-8 text-right text-foreground">
        {value}%
      </span>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetAnalyticsSummary();
  const {
    data: subjectAccuracy = [],
    isLoading: accuracyLoading,
    isError: accuracyError,
  } = useGetSubjectAccuracy();

  const isLoading = summaryLoading || accuracyLoading;
  const isError = summaryError || accuracyError;

  // Derived values from backend data
  const dailyAccuracy = summary?.dailyAccuracyLast7Days ?? [];
  const weeklyStudyMinutes = summary?.weeklyStudyMinutesPerDay ?? [];

  const avgDailyAccuracy =
    dailyAccuracy.length > 0
      ? Math.round(
          dailyAccuracy.reduce((acc, d) => acc + Number(d.accuracyPercent), 0) /
            dailyAccuracy.length,
        )
      : 0;

  const bestSubject =
    subjectAccuracy.length > 0
      ? subjectAccuracy.reduce((best, curr) =>
          Number(curr.accuracyPercent) > Number(best.accuracyPercent)
            ? curr
            : best,
        )
      : null;

  const totalStudyHours = summary ? Number(summary.totalStudyHoursThisWeek) : 0;

  const totalQuestionsAttempted = subjectAccuracy.reduce(
    (sum, s) => sum + Number(s.totalAttempts),
    0,
  );
  const totalCorrect = subjectAccuracy.reduce(
    (sum, s) => sum + Number(s.correctAttempts),
    0,
  );
  const overallAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
      : 0;

  // Weak subjects = accuracy < 60%
  const weakSubjects = subjectAccuracy
    .filter((s) => Number(s.accuracyPercent) < 60)
    .map((s) => s.subject);

  const summaryCards = [
    {
      label: "Study Hours (Week)",
      value: `${totalStudyHours}h`,
      icon: <Clock size={16} />,
      colorClass: "text-primary bg-primary/10",
      sub: `${weeklyStudyMinutes.reduce((s, [, m]) => s + Number(m), 0)} min logged`,
    },
    {
      label: "Avg Daily Accuracy",
      value: `${avgDailyAccuracy}%`,
      icon: <Target size={16} />,
      colorClass: "text-chart-5 bg-chart-5/10",
      sub: "7-day rolling average",
    },
    {
      label: "Best Subject",
      value: bestSubject?.subject ?? "—",
      icon: <Star size={16} />,
      colorClass: "text-accent bg-accent/10",
      sub: bestSubject
        ? `${Number(bestSubject.accuracyPercent)}% accuracy`
        : "Practice more",
    },
    {
      label: "Questions Attempted",
      value:
        totalQuestionsAttempted > 0 ? String(totalQuestionsAttempted) : "—",
      icon: <BookOpen size={16} />,
      colorClass: "text-chart-3 bg-chart-3/10",
      sub:
        totalQuestionsAttempted > 0
          ? `${overallAccuracy}% correct`
          : "No attempts yet",
    },
  ];

  const lineChartData = dailyAccuracy.map((d) => ({
    date: d.date,
    accuracy: Number(d.accuracyPercent),
  }));

  const barChartData = subjectAccuracy.map((s) => ({
    subject: s.subject,
    accuracy: Number(s.accuracyPercent),
  }));

  const weeklyBarData = weeklyStudyMinutes.map(([day, mins]) => ({
    day,
    minutes: Number(mins),
  }));

  const radarData = subjectAccuracy.map((s) => ({
    subject: s.subject.substring(0, 4),
    accuracy: Number(s.accuracyPercent),
    fullMark: 100,
  }));

  return (
    <div
      className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto"
      data-ocid="analytics-page"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Performance Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personalized study performance overview
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs bg-muted/50 text-muted-foreground border-border hidden sm:flex"
        >
          Auto-refreshes with new attempts
        </Badge>
      </div>

      {/* Error state */}
      {isError ? (
        <div
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-2"
          data-ocid="analytics-error"
        >
          <p className="font-semibold text-foreground">
            Couldn't load your analytics
          </p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page to try again.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stat cards */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            data-ocid="stats-cards"
          >
            {summaryCards.map((c) => (
              <Card
                key={c.label}
                className="border shadow-xs hover:shadow-sm transition-smooth"
              >
                <CardContent className="p-4">
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${c.colorClass}`}
                  >
                    {c.icon}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mb-1" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground leading-none">
                      {c.value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.label}
                  </p>
                  <p className="text-xs text-muted-foreground/60 truncate mt-1">
                    {c.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 7-Day Accuracy Line Chart */}
              <Card
                className="border shadow-xs"
                data-ocid="accuracy-trend-chart"
              >
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>7-Day Accuracy Trend</span>
                    {lineChartData.length >= 2 && (
                      <TrendBadge
                        current={
                          lineChartData[lineChartData.length - 1]?.accuracy ?? 0
                        }
                        previous={
                          lineChartData[lineChartData.length - 2]?.accuracy ?? 0
                        }
                      />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart
                      data={
                        lineChartData.length > 0
                          ? lineChartData
                          : [{ date: "—", accuracy: 0 }]
                      }
                    >
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[40, 100]}
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <ReferenceLine
                        y={60}
                        stroke={CHART_COLORS.destructive()}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [`${v}%`, "Accuracy"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke={CHART_COLORS.primary()}
                        strokeWidth={2.5}
                        dot={{
                          fill: CHART_COLORS.primary(),
                          r: 3.5,
                          strokeWidth: 0,
                        }}
                        activeDot={{
                          r: 5,
                          fill: CHART_COLORS.accent(),
                          strokeWidth: 0,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subject Accuracy Bar Chart */}
              <Card
                className="border shadow-xs"
                data-ocid="subject-accuracy-chart"
              >
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Subject-wise Accuracy</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      60% target line
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={
                        barChartData.length > 0
                          ? barChartData
                          : [{ subject: "—", accuracy: 0 }]
                      }
                      layout="vertical"
                      barSize={14}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="subject"
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                        axisLine={false}
                        tickLine={false}
                        width={75}
                      />
                      <ReferenceLine
                        x={60}
                        stroke={CHART_COLORS.destructive()}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [`${v}%`, "Accuracy"]}
                      />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                        {barChartData.map((entry) => (
                          <Cell
                            key={entry.subject}
                            fill={(
                              SUBJECT_CHART_COLORS[entry.subject] ??
                              CHART_COLORS.primary
                            )()}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Study Time */}
              <Card className="border shadow-xs" data-ocid="study-time-chart">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold">
                    Daily Study Time (minutes)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={
                        weeklyBarData.length > 0
                          ? weeklyBarData
                          : [{ day: "—", minutes: 0 }]
                      }
                      barSize={22}
                    >
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 140]}
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [`${v} min`, "Study Time"]}
                      />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {(weeklyBarData.length > 0
                          ? weeklyBarData
                          : [{ day: "—", minutes: 0 }]
                        ).map((entry) => (
                          <Cell
                            key={entry.day}
                            fill={
                              entry.minutes > 0
                                ? CHART_COLORS.primary()
                                : CHART_COLORS.muted()
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card
                className="border shadow-xs"
                data-ocid="subject-radar-chart"
              >
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between flex-wrap gap-2">
                    <span>Subject Radar</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {weakSubjects.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-xs bg-destructive/8 text-destructive border-destructive/25"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart
                      data={
                        radarData.length > 0
                          ? radarData
                          : [{ subject: "—", accuracy: 0, fullMark: 100 }]
                      }
                    >
                      <PolarGrid stroke={CHART_COLORS.border()} />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 11, fill: CHART_COLORS.mutedFg() }}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        dataKey="accuracy"
                        stroke={CHART_COLORS.primary()}
                        fill={CHART_COLORS.primary()}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [`${v}%`, "Accuracy"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Weak Areas List */}
          <Card className="border shadow-xs" data-ocid="weak-areas-list">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={14} className="text-destructive" />
                Weak Areas — Subjects Below 60% Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : subjectAccuracy.filter((s) => Number(s.accuracyPercent) < 60)
                  .length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No weak areas — all subjects above 60%. Keep it up!
                </p>
              ) : (
                <div className="space-y-0 divide-y divide-border/50">
                  {subjectAccuracy
                    .filter((s) => Number(s.accuracyPercent) < 60)
                    .sort(
                      (a, b) =>
                        Number(a.accuracyPercent) - Number(b.accuracyPercent),
                    )
                    .map((item, idx) => (
                      <div
                        key={item.subject}
                        className="flex items-center gap-4 py-3 group"
                        data-ocid={`weak-topic-${idx}`}
                      >
                        <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">
                          {idx + 1}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${SUBJECT_BG[item.subject] ?? "bg-muted text-muted-foreground border-border"}`}
                        >
                          {item.subject}
                        </Badge>
                        <span className="flex-1 text-sm text-foreground font-medium truncate min-w-0">
                          {Number(item.totalAttempts)} attempts
                        </span>
                        <div className="w-32 shrink-0">
                          <AccuracyBar value={Number(item.accuracyPercent)} />
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                  Critical (&lt;50%)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
                  Needs Work (50–59%)
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
