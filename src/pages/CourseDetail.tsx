import { useState, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import confetti from "canvas-confetti";
import { useParams, Link } from "react-router-dom";
import { Lock, PlayCircle, FileText, ArrowLeft, AlertTriangle, LogOut, CheckCircle, Circle, ShieldBan, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCourse } from "@/hooks/use-courses";
import { useCourseChapters, type Chapter } from "@/hooks/use-chapters";
import { useIsEnrolled, useEnroll } from "@/hooks/use-enrollments";
import { useChapterQuiz, useQuizQuestions, useSubmitQuizAttempt, type QuizQuestion } from "@/hooks/use-quizzes";
import { useCourseProgress, useToggleChapterComplete } from "@/hooks/use-chapter-progress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";

const QuizSection = ({ chapterId }: { chapterId: string }) => {
  const { data: quiz } = useChapterQuiz(chapterId);
  const { data: questions = [] } = useQuizQuestions(quiz?.id);
  const submitAttempt = useSubmitQuizAttempt();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; correct_answers: number[] } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#10b981", "#34d399", "#6ee7b7"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#10b981", "#34d399", "#6ee7b7"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  if (!quiz || questions.length === 0) return null;

  const total = questions.length;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;
  const optionLetters = ["A", "B", "C", "D"];

  const handleSubmit = async () => {
    const answerArray = questions.map((_, i) => answers[i] ?? -1);
    try {
      const res = await submitAttempt.mutateAsync({ quiz_id: quiz.id, answers: answerArray });
      setResult({ score: res.score, total: res.total, correct_answers: res.correct_answers });
      setShowSummary(true);
      setReviewMode(false);
      if (res.score === res.total) fireConfetti();
      toast.success(`Score: ${res.score}/${res.total}`);
    } catch {
      toast.error("Failed to submit quiz");
    }
  };

  const handleQuit = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setReviewMode(false);
    setShowSummary(false);
  };

  const startReview = (index?: number) => {
    setShowSummary(false);
    setReviewMode(true);
    setCurrentIndex(index ?? 0);
  };

  const getOptionStyle = (oIndex: number) => {
    if (!reviewMode || !result) {
      const isSelected = answers[currentIndex] === oIndex;
      return isSelected
        ? "border-primary bg-primary/20 text-foreground shadow-lg shadow-primary/10"
        : "border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:bg-card";
    }
    const correctIndex = result.correct_answers[currentIndex];
    const userAnswer = answers[currentIndex];
    if (oIndex === correctIndex) return "border-success bg-success/15 text-success";
    if (oIndex === userAnswer && oIndex !== correctIndex) return "border-destructive bg-destructive/15 text-destructive";
    return "border-border bg-card/30 text-muted-foreground/50";
  };

  const getLetterStyle = (oIndex: number) => {
    if (!reviewMode || !result) {
      return answers[currentIndex] === oIndex
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground";
    }
    const correctIndex = result.correct_answers[currentIndex];
    const userAnswer = answers[currentIndex];
    if (oIndex === correctIndex) return "bg-success text-success-foreground";
    if (oIndex === userAnswer) return "bg-destructive text-destructive-foreground";
    return "bg-muted text-muted-foreground/50";
  };

  return (
    <div className="mt-8">
      <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-xl">

        {/* Summary screen after submission */}
        {showSummary && result ? (
          <div>
            <div className="text-center mb-8">
              <CheckCircle className="w-14 h-14 text-success mx-auto mb-3" />
              <p className="text-3xl font-bold text-foreground mb-1">{result.score}/{result.total}</p>
              <p className="text-sm text-muted-foreground">
                {result.score === result.total ? "Perfect score! 🎉" : result.score >= result.total / 2 ? "Good job! 👍" : "Keep practicing! 💪"}
              </p>
            </div>

            {/* Questions summary grid */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">Questions Overview</h4>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {questions.map((q, i) => {
                  const isCorrect = answers[i] === result.correct_answers[i];
                  return (
                    <button
                      key={q.id}
                      onClick={() => startReview(i)}
                      className={`relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105 ${
                        isCorrect
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-destructive/15 text-destructive border border-destructive/30"
                      }`}
                    >
                      {i + 1}
                      <span className="absolute -top-1 -right-1">
                        {isCorrect ? (
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-destructive" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => startReview()} variant="default" size="sm">
                Review All Answers
              </Button>
              <Button variant="outline" onClick={handleQuit} size="sm">
                Retake Quiz
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {reviewMode ? "Review" : "Quiz Progress"}
                </span>
                <Progress value={progressPercent} className="h-2 flex-1 max-w-[200px]" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">{answeredCount}/{total} answered</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={reviewMode ? () => { setReviewMode(false); setShowSummary(true); } : handleQuit}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
              >
                {reviewMode ? "Back to Summary" : "Quit"}
              </Button>
            </div>

            {/* Review per-question indicator */}
            {reviewMode && result && (
              <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg bg-muted border border-border">
                <span className="text-sm text-muted-foreground">Score:</span>
                <span className="text-sm font-bold text-foreground">{result.score}/{result.total}</span>
                <span className="text-xs ml-2">
                  {answers[currentIndex] === result.correct_answers[currentIndex] ? (
                    <span className="flex items-center gap-1 text-success"><CheckCircle className="w-3.5 h-3.5" /> Correct</span>
                  ) : (
                    <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3.5 h-3.5" /> Wrong</span>
                  )}
                </span>
              </div>
            )}

            {/* Question */}
            <p className="text-lg md:text-xl text-foreground font-medium mb-8 leading-relaxed">
              {currentQ.question}
            </p>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {currentQ.options.map((opt, oIndex) => (
                <button
                  key={oIndex}
                  onClick={() => !reviewMode && setAnswers(prev => ({ ...prev, [currentIndex]: oIndex }))}
                  disabled={reviewMode}
                  className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-sm transition-all duration-200 ${getOptionStyle(oIndex)} ${reviewMode ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className={`text-xs font-bold w-6 h-6 rounded flex items-center justify-center shrink-0 ${getLetterStyle(oIndex)}`}>
                    {optionLetters[oIndex] ?? oIndex + 1}
                  </span>
                  <span>{opt}</span>
                  {reviewMode && result && oIndex === result.correct_answers[currentIndex] && (
                    <CheckCircle className="w-4 h-4 ml-auto text-success shrink-0" />
                  )}
                  {reviewMode && result && oIndex === answers[currentIndex] && oIndex !== result.correct_answers[currentIndex] && (
                    <XCircle className="w-4 h-4 ml-auto text-destructive shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <div>
                {currentIndex > 0 && (
                  <Button
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    variant="ghost"
                    className="rounded-lg px-5"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>
              <div>
                {reviewMode ? (
                  currentIndex < total - 1 ? (
                    <Button onClick={() => setCurrentIndex(prev => prev + 1)} variant="secondary" className="rounded-lg px-6">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={() => { setReviewMode(false); setShowSummary(true); }} variant="secondary" className="rounded-lg px-6">
                      Done
                    </Button>
                  )
                ) : currentIndex < total - 1 ? (
                  <Button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    disabled={answers[currentIndex] === undefined}
                    variant="secondary"
                    className="rounded-lg px-6"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < total || submitAttempt.isPending}
                    className="rounded-lg px-6"
                  >
                    {submitAttempt.isPending ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: chapters = [], isLoading: chaptersLoading } = useCourseChapters(courseId);
  const { data: enrollmentData } = useIsEnrolled(courseId);
  const isEnrolled = enrollmentData?.enrolled ?? false;
  const enrollmentStatus = enrollmentData?.status;
  const isAccessBlocked = enrollmentStatus === "suspended" || enrollmentStatus === "banned";
  const enroll = useEnroll();

  const chapterIds = chapters.map((ch) => ch.id);
  const { data: progressData = [] } = useCourseProgress(courseId, chapterIds);
  const toggleComplete = useToggleChapterComplete();

  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Set first chapter as active once loaded
  useEffect(() => {
    if (!activeChapterId && chapters.length > 0) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

  if (courseLoading || chaptersLoading) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  }

  if (!course) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Course not found.</p></div>;
  }

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId) ?? chapters[0];
  const activeChapterIndex = chapters.findIndex((ch) => ch.id === activeChapter?.id);

  // Progress calculations
  const completedSet = new Set(progressData.filter((p) => p.is_completed).map((p) => p.chapter_id));
  const completedCount = completedSet.size;
  const progressPercent = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;
  const isActiveCompleted = activeChapter ? completedSet.has(activeChapter.id) : false;

  // Sequential unlock: a chapter is unlocked if it's the first, or the previous chapter is completed
  const isChapterUnlocked = (index: number) => {
    if (!isEnrolled) return false;
    if (index === 0) return true;
    const prevChapter = chapters[index - 1];
    return completedSet.has(prevChapter.id);
  };

  const isLocked = isAccessBlocked || (activeChapter && !isEnrolled
    ? !activeChapter.is_free
    : activeChapter && isEnrolled
      ? !isChapterUnlocked(activeChapterIndex)
      : false);

  const handleEnroll = async () => {
    try {
      await enroll.mutateAsync(course.id);
      toast.success("Enrolled successfully!");
    } catch {
      toast.error("Failed to enroll");
    }
  };

  const handleToggleComplete = async () => {
    if (!activeChapter || !courseId) return;
    try {
      await toggleComplete.mutateAsync({
        chapterId: activeChapter.id,
        courseId,
        isCompleted: !isActiveCompleted,
      });
      toast.success(isActiveCompleted ? "Marked as incomplete" : "Chapter completed!");
    } catch {
      toast.error("Failed to update progress");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Chapter Sidebar */}
      <aside className="w-64 min-h-screen border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm leading-tight">{course.title}</h2>
          {isEnrolled && chapters.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{completedCount}/{chapters.length} completed</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-auto py-2">
          <TooltipProvider delayDuration={300}>
            {chapters.map((ch, index) => {
              const isActive = ch.id === activeChapter?.id;
              const completed = completedSet.has(ch.id);
              const locked = isEnrolled ? !isChapterUnlocked(index) : (!ch.is_free);
              const btn = (
                <button
                  key={ch.id}
                  onClick={() => !locked && setActiveChapterId(ch.id)}
                  disabled={locked}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200 ${
                    locked
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : isActive
                        ? "bg-primary/10 border-l-[3px] border-primary text-primary font-medium"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  }`}
                >
                  {locked ? (
                    <Lock className="w-4 h-4 shrink-0" />
                  ) : completed ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-primary" />
                  ) : isActive ? (
                    <PlayCircle className="w-4 h-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">{ch.title}</span>
                </button>
              );
              if (locked) {
                return (
                  <Tooltip key={ch.id}>
                    <TooltipTrigger asChild>
                      <div>{btn}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Complete the previous chapter to unlock this one</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return btn;
            })}
          </TooltipProvider>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <Link to="/browse" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/browse" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              Exit
            </Link>
          </div>
        </header>

        {isAccessBlocked && (
          <div className="bg-destructive/20 border-b border-destructive/30 px-6 py-3 flex items-center gap-2">
            <ShieldBan className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              Your access to this course has been {enrollmentStatus === "banned" ? "revoked" : "suspended"} by the instructor.
            </span>
          </div>
        )}

        {isLocked && !isAccessBlocked && (
          <div className="bg-warning/20 border-b border-warning/30 px-6 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-foreground" />
            <span className="text-sm text-warning-foreground">You need to enroll in this course to access this chapter.</span>
          </div>
        )}

        <main className="flex-1 overflow-auto animate-fade-in">
          <div className="aspect-video bg-foreground/95 flex items-center justify-center max-w-4xl mx-auto w-full">
            {isLocked ? (
              <div className="text-center">
                <Lock className="w-10 h-10 text-white mx-auto mb-2" />
                <p className="text-white text-sm">This chapter is locked</p>
              </div>
            ) : activeChapter?.video_url ? (
              <MuxPlayer
                key={activeChapter.video_url}
                playbackId={activeChapter.video_url}
                className="w-full h-full"
                metadata={{ video_title: activeChapter.title }}
              />
            ) : (
              <div className="text-center">
                <PlayCircle className="w-16 h-16 text-muted-foreground/60 mx-auto" />
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto w-full p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-foreground">{activeChapter?.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                {isEnrolled && activeChapter && (
                  <Button
                    variant={isActiveCompleted ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggleComplete}
                    disabled={toggleComplete.isPending}
                  >
                    {isActiveCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-1.5" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                )}
                {!isEnrolled && course.price != null && course.price > 0 && (
                  <Button onClick={handleEnroll} disabled={enroll.isPending}>
                    {enroll.isPending ? "Enrolling..." : `Enroll for $${Number(course.price).toFixed(2)}`}
                  </Button>
                )}
                {!isEnrolled && (!course.price || course.price === 0) && (
                  <Button onClick={handleEnroll} disabled={enroll.isPending}>
                    {enroll.isPending ? "Enrolling..." : "Enroll for Free"}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Description:</h3>
              <div className="rich-text text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeChapter?.description || "No description") }} />
            </div>

            {isEnrolled && activeChapter && <QuizSection chapterId={activeChapter.id} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDetail;
