import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useListQuestions, useSubmitAnswer } from "../hooks/useBackend";
import { Difficulty } from "../types";
import type { Question, Subject } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ["Physics", "Chemistry", "Biology", "Mathematics"];
const TIMER_SECONDS = 120;

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  Chemistry: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  Biology: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  Mathematics: "bg-accent/10 text-accent border-accent/30",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  [Difficulty.easy]: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  [Difficulty.medium]: "bg-accent/10 text-accent border-accent/30",
  [Difficulty.hard]: "bg-destructive/10 text-destructive border-destructive/30",
};

// ─── Local attempt state (session-only — persisted to backend via submitAnswer) ─

type LocalAttempt = {
  selectedOption: number;
  isCorrect: boolean;
};

// ─── Timer Widget ─────────────────────────────────────────────────────────────

function TimerBadge({
  secondsLeft,
  isAnswered,
}: {
  secondsLeft: number;
  isAnswered: boolean;
}) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = (secondsLeft / TIMER_SECONDS) * 100;
  const urgent = !isAnswered && secondsLeft <= 30;
  const done = isAnswered || secondsLeft === 0;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium transition-smooth
        ${done ? "bg-muted/60 border-border text-muted-foreground" : urgent ? "bg-destructive/10 border-destructive/40 text-destructive" : "bg-primary/8 border-primary/30 text-primary"}`}
      data-ocid="question-timer"
    >
      <Clock size={12} />
      <span>
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      {!done && (
        <div className="w-12 h-1 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${urgent ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {done && isAnswered && <span className="text-[10px]">done</span>}
      {done && !isAnswered && <span className="text-[10px]">time up</span>}
    </div>
  );
}

// ─── Subject Accuracy Panel ───────────────────────────────────────────────────

function SubjectAccuracyPanel({
  attempts,
  questions,
}: {
  attempts: Record<string, LocalAttempt>;
  questions: Question[];
}) {
  const stats = SUBJECTS.map((subject) => {
    const subjectQs = questions.filter((q) => q.subject === subject);
    const answered = subjectQs.filter((q) => attempts[q.id.toString()]);
    const correct = answered.filter(
      (q) => attempts[q.id.toString()]?.isCorrect,
    );
    const pct =
      answered.length > 0
        ? Math.round((correct.length / answered.length) * 100)
        : null;
    return { subject, pct, answered: answered.length, total: subjectQs.length };
  }).filter((s) => s.answered > 0);

  if (stats.length === 0) return null;

  return (
    <Card className="border shadow-xs" data-ocid="subject-accuracy-panel">
      <CardHeader className="pb-2 pt-3 px-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Accuracy by Subject
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {stats.map(({ subject, pct, answered, total }) => (
          <div key={subject} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0 px-1.5 ${SUBJECT_COLORS[subject] ?? ""}`}
                >
                  {subject}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {answered}/{total}
                </span>
              </div>
              <span
                className={`text-xs font-bold tabular-nums ${(pct ?? 0) >= 70 ? "text-chart-5" : (pct ?? 0) >= 50 ? "text-accent" : "text-destructive"}`}
              >
                {pct ?? 0}%
              </span>
            </div>
            <Progress
              value={pct ?? 0}
              className={`h-1.5 ${(pct ?? 0) >= 70 ? "[&>div]:bg-chart-5" : (pct ?? 0) >= 50 ? "[&>div]:bg-accent" : "[&>div]:bg-destructive"}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Question Timer (resets on key change) ────────────────────────────────────

function QuestionTimer({ onExpire }: { onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const callbackRef = useRef(onExpire);
  callbackRef.current = onExpire;

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          callbackRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <TimerBadge secondsLeft={secondsLeft} isAnswered={false} />;
}

function QuestionCard({
  question,
  attempt,
  onSubmit,
}: {
  question: Question;
  attempt?: LocalAttempt;
  onSubmit: (qId: bigint, optIdx: number, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = attempt !== undefined;

  const handleSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelected(optIdx);
    const isCorrect = BigInt(optIdx) === question.correctOptionIndex;
    onSubmit(question.id, optIdx, isCorrect);
  };

  const handleExpire = () => {
    if (!isAnswered) {
      onSubmit(question.id, -1, false);
    }
  };

  return (
    <Card className="border shadow-xs" data-ocid="question-card">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs ${DIFFICULTY_COLORS[question.difficulty]}`}
            >
              {question.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${SUBJECT_COLORS[question.subject] ?? "bg-secondary text-secondary-foreground"}`}
            >
              {question.subject}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {question.topic} · {Number(question.year)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAnswered ? (
              <>
                <TimerBadge secondsLeft={0} isAnswered />
                {attempt.isCorrect ? (
                  <CheckCircle2
                    size={18}
                    className="text-chart-5"
                    aria-label="Correct"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-destructive"
                    aria-label="Incorrect"
                  />
                )}
              </>
            ) : (
              <QuestionTimer onExpire={handleExpire} />
            )}
          </div>
        </div>
        <p className="text-sm font-medium text-foreground mt-2 leading-relaxed">
          {question.questionText}
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = BigInt(idx) === question.correctOptionIndex;
            let variantClass =
              "border-border hover:border-primary/50 hover:bg-primary/5";
            if (isAnswered) {
              if (isCorrect)
                variantClass = "border-chart-5/60 bg-chart-5/8 text-foreground";
              else if (isSelected)
                variantClass =
                  "border-destructive/60 bg-destructive/8 text-foreground";
              else variantClass = "border-border opacity-50";
            } else if (isSelected) {
              variantClass = "border-primary/60 bg-primary/8";
            }

            return (
              <button
                type="button"
                key={`${question.id}-${idx}`}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-smooth cursor-pointer disabled:cursor-default ${variantClass}`}
                data-ocid="answer-option"
              >
                <span className="font-medium mr-2 text-muted-foreground">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {isAnswered && !attempt.isCorrect && (
          <p className="mt-3 text-xs text-chart-5 flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Correct:{" "}
            {question.options[Number(question.correctOptionIndex)] ??
              "See options"}
          </p>
        )}
        {isAnswered && attempt.selectedOption === -1 && (
          <p className="mt-1 text-xs text-destructive/80 flex items-center gap-1.5">
            <Clock size={12} />
            Time expired — marked incorrect
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const [subjectFilter, setSubjectFilter] = useState<Subject | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(
    null,
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  // Local session attempts (frontend only — each correct/incorrect also calls backend)
  const [attempts, setAttempts] = useState<Record<string, LocalAttempt>>({});

  const {
    data: questions = [],
    isLoading,
    isError: questionsError,
  } = useListQuestions(subjectFilter, difficultyFilter);
  const submitAnswer = useSubmitAnswer();

  const answered = questions.filter((q) => attempts[q.id.toString()]);
  const correct = answered.filter((q) => attempts[q.id.toString()]?.isCorrect);
  const accuracy =
    answered.length > 0
      ? Math.round((correct.length / answered.length) * 100)
      : 0;

  const safeIdx = Math.min(currentIdx, Math.max(questions.length - 1, 0));
  const currentQuestion = questions[safeIdx];

  const handleSubmit = (qId: bigint, optIdx: number, isCorrect: boolean) => {
    setAttempts((prev) => ({
      ...prev,
      [qId.toString()]: { selectedOption: optIdx, isCorrect },
    }));
    // Persist to backend (fire-and-forget; negative means timed out)
    if (optIdx >= 0) {
      submitAnswer.mutate({
        questionId: qId,
        selectedOptionIndex: BigInt(optIdx),
      });
    }
    if (safeIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 1200);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_256px] gap-6">
        {/* ── Left: main practice area ── */}
        <div className="space-y-5 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                PYQ Practice
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isLoading
                  ? "Loading questions…"
                  : `${questions.length} questions · ${answered.length} answered`}
              </p>
            </div>
            {answered.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className={`text-lg font-bold tabular-nums ${accuracy >= 70 ? "text-chart-5" : accuracy >= 50 ? "text-accent" : "text-destructive"}`}
                  >
                    {accuracy}%
                  </p>
                  <p className="text-xs text-muted-foreground">overall</p>
                </div>
                <div className="w-20">
                  <Progress value={accuracy} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div
            className="flex items-center gap-3 flex-wrap"
            data-ocid="practice-filters"
          >
            <Filter size={14} className="text-muted-foreground flex-shrink-0" />
            <Select
              value={subjectFilter ?? "all"}
              onValueChange={(v) => {
                setSubjectFilter(v === "all" ? null : v);
                setCurrentIdx(0);
              }}
            >
              <SelectTrigger
                className="w-40 h-8 text-xs"
                data-ocid="filter-subject"
              >
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={difficultyFilter ?? "all"}
              onValueChange={(v) => {
                setDifficultyFilter(v === "all" ? null : (v as Difficulty));
                setCurrentIdx(0);
              }}
            >
              <SelectTrigger
                className="w-36 h-8 text-xs"
                data-ocid="filter-difficulty"
              >
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value={Difficulty.easy}>Easy</SelectItem>
                <SelectItem value={Difficulty.medium}>Medium</SelectItem>
                <SelectItem value={Difficulty.hard}>Hard</SelectItem>
              </SelectContent>
            </Select>

            {(subjectFilter || difficultyFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => {
                  setSubjectFilter(null);
                  setDifficultyFilter(null);
                  setCurrentIdx(0);
                }}
                data-ocid="clear-filters"
              >
                Clear filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="w-7 h-7 rounded" />
                ))}
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : questionsError ? (
            <div
              className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-2"
              data-ocid="practice-error"
            >
              <p className="font-semibold text-foreground">
                Couldn't load questions
              </p>
              <p className="text-sm text-muted-foreground">
                Please refresh the page to try again.
              </p>
            </div>
          ) : (
            <>
              {/* Question navigator pills */}
              <nav
                className="flex items-center gap-1.5 flex-wrap"
                aria-label="Question navigation"
              >
                {questions.map((q, idx) => {
                  const att = attempts[q.id.toString()];
                  let pillClass =
                    "bg-muted border-border text-muted-foreground hover:border-primary/40";
                  if (att)
                    pillClass = att.isCorrect
                      ? "bg-chart-5/15 border-chart-5/40 text-chart-5"
                      : att.selectedOption === -1
                        ? "bg-muted border-destructive/30 text-destructive/60"
                        : "bg-destructive/15 border-destructive/40 text-destructive";
                  if (idx === safeIdx)
                    pillClass += " ring-2 ring-primary ring-offset-1";

                  return (
                    <button
                      type="button"
                      key={q.id.toString()}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-7 h-7 rounded border text-[10px] font-medium transition-fast ${pillClass}`}
                      aria-label={`Question ${idx + 1}`}
                      data-ocid="question-nav-pill"
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </nav>

              {/* Current question */}
              {currentQuestion ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Question {safeIdx + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={safeIdx === 0}
                        onClick={() => setCurrentIdx((i) => i - 1)}
                        aria-label="Previous question"
                        data-ocid="prev-question"
                      >
                        <ChevronLeft size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={safeIdx === questions.length - 1}
                        onClick={() => setCurrentIdx((i) => i + 1)}
                        aria-label="Next question"
                        data-ocid="next-question"
                      >
                        <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>

                  <QuestionCard
                    key={currentQuestion.id.toString()}
                    question={currentQuestion}
                    attempt={attempts[currentQuestion.id.toString()]}
                    onSubmit={handleSubmit}
                  />
                </>
              ) : (
                <div
                  className="text-center py-16 space-y-3"
                  data-ocid="empty-state"
                >
                  <BookMarked
                    size={32}
                    className="mx-auto text-muted-foreground/30"
                  />
                  <p className="text-foreground font-medium">
                    No questions match your filters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting the subject or difficulty filter
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSubjectFilter(null);
                      setDifficultyFilter(null);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: stats sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <SubjectAccuracyPanel attempts={attempts} questions={questions} />

          {/* Session stats */}
          {answered.length > 0 && (
            <Card className="border shadow-xs" data-ocid="session-stats">
              <CardContent className="px-4 py-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Session
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground tabular-nums">
                      {answered.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Answered
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-chart-5 tabular-nums">
                      {correct.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-destructive tabular-nums">
                      {answered.length - correct.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Wrong</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Difficulty breakdown */}
          <Card className="border shadow-xs">
            <CardContent className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Difficulty
              </p>
              {[Difficulty.easy, Difficulty.medium, Difficulty.hard].map(
                (d) => {
                  const count = questions.filter(
                    (q) => q.difficulty === d,
                  ).length;
                  const done = questions.filter(
                    (q) => q.difficulty === d && attempts[q.id.toString()],
                  ).length;
                  return (
                    <div key={d} className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 ${DIFFICULTY_COLORS[d]}`}
                      >
                        {d}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {done}/{count}
                      </span>
                    </div>
                  );
                },
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
