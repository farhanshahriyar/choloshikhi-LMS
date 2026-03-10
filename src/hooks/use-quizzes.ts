import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


export interface Quiz {
  id: string;
  chapter_id: string;
  title: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
  position: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total: number;
  created_at: string;
}

export const useChapterQuiz = (chapterId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("chapter_id", chapterId!)
        .maybeSingle();
      if (error) throw error;
      return data as Quiz | null;
    },
    enabled: !!chapterId,
  });
};

export const useQuizQuestions = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_student_quiz_questions", { _quiz_id: quizId! });
      if (error) throw error;
      return (data || []).map((q: Record<string, unknown>) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })) as Omit<QuizQuestion, "correct_index">[];
    },
    enabled: !!quizId,
  });
};

// Teacher-only: fetches all columns including correct_index (RLS restricts to course teachers)
export const useQuizQuestionsTeacher = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz-questions-teacher", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data || []).map((q: Record<string, unknown>) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })) as QuizQuestion[];
    },
    enabled: !!quizId,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chapter_id, title }: { chapter_id: string; title: string }) => {
      const { data, error } = await supabase
        .from("quizzes")
        .insert({ chapter_id, title })
        .select()
        .single();
      if (error) throw error;
      return data as Quiz;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", data.chapter_id] });
    },
  });
};

export const useUpsertQuizQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId, questions }: { quizId: string; questions: Omit<QuizQuestion, "id">[] }) => {
      // Fetch existing for potential rollback
      const { data: oldQuestions } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId);
      
      // Delete existing
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
      
      // Insert new
      if (questions.length > 0) {
        const { error } = await supabase.from("quiz_questions").insert(
          questions.map((q, i) => ({ ...q, quiz_id: quizId, position: i }))
        );
        if (error) {
          // Rollback
          if (oldQuestions && oldQuestions.length > 0) {
            await supabase.from("quiz_questions").insert(oldQuestions);
          }
          throw error;
        }
      }
    },
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
    },
  });
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quiz_id, answers }: { quiz_id: string; answers: number[] }) => {
      const { data, error } = await supabase.functions.invoke("submit-quiz", {
        body: { quiz_id, answers },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { score: number; total: number; attempt_id: string; correct_answers: number[] };
    },
    onSuccess: (_, { quiz_id }) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quiz_id] });
    },
  });
};

export const useQuizAttempts = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!quizId,
  });
};
