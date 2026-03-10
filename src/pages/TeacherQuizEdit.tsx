import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useChapterQuiz, useCreateQuiz, useQuizQuestionsTeacher, useUpsertQuizQuestions, type QuizQuestion } from "@/hooks/use-quizzes";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";

const TeacherQuizEdit = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { data: quiz, isLoading: quizLoading } = useChapterQuiz(chapterId);
  const { data: existingQuestions = [], isLoading: questionsLoading } = useQuizQuestionsTeacher(quiz?.id);
  const createQuiz = useCreateQuiz();
  const upsertQuestions = useUpsertQuizQuestions();

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Omit<QuizQuestion, "id">[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from existing data
  useEffect(() => {
    if (!initialized && !quizLoading && (!quiz?.id || !questionsLoading)) {
      if (quiz) {
        setQuizTitle(quiz.title);
        if (existingQuestions.length > 0) {
          setQuestions(existingQuestions.map(q => ({
            quiz_id: q.quiz_id,
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
            position: q.position,
          })));
        }
      } else {
        setQuizTitle("Chapter Quiz");
      }
      setInitialized(true);
    }
  }, [initialized, quizLoading, questionsLoading, quiz, existingQuestions]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      quiz_id: quiz?.id ?? "",
      question: "",
      options: ["", "", "", ""],
      correct_index: 0,
      position: prev.length,
    }]);
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = [...q.options];
      opts[oIndex] = value;
      return { ...q, options: opts };
    }));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!chapterId) return;
    try {
      let quizId = quiz?.id;
      if (!quizId) {
        const created = await createQuiz.mutateAsync({ chapter_id: chapterId, title: quizTitle });
        quizId = created.id;
      }
      await upsertQuestions.mutateAsync({
        quizId,
        questions: questions.map((q, i) => ({ ...q, quiz_id: quizId!, position: i })),
      });
      toast.success("Quiz saved");
      navigate(`/teacher/course/${courseId}/chapter/${chapterId}`);
    } catch {
      toast.error("Failed to save quiz");
    }
  };

  if (quizLoading) return <PageTransition><TopBar /><main className="flex-1 p-6 flex items-center justify-center text-muted-foreground">Loading...</main></PageTransition>;

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto">
        <button onClick={() => navigate(`/teacher/course/${courseId}/chapter/${chapterId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to chapter
        </button>

        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Quiz Editor</h1>
            <Button onClick={handleSave} disabled={upsertQuestions.isPending}>
              {upsertQuestions.isPending ? "Saving..." : "Save Quiz"}
            </Button>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-foreground">Quiz Title</label>
            <input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-3 py-2 mt-1 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Question {qIndex + 1}</span>
                  <button onClick={() => removeQuestion(qIndex)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full px-3 py-2 mb-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct_index === oIndex}
                        onChange={() => updateQuestion(qIndex, "correct_index", oIndex)}
                        className="accent-primary"
                      />
                      <input
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <Button variant="outline" onClick={addQuestion} className="mt-4 w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>
      </main>
    </PageTransition>
  );
};

export default TeacherQuizEdit;
