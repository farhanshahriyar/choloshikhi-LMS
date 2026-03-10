import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChapterProgress {
  id: string;
  user_id: string;
  chapter_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useCourseProgress = (courseId: string | undefined, chapterIds: string[]) => {
  return useQuery({
    queryKey: ["chapter-progress", courseId],
    queryFn: async () => {
      if (chapterIds.length === 0) return [];
      const { data, error } = await supabase
        .from("chapter_progress")
        .select("*")
        .in("chapter_id", chapterIds);
      if (error) throw error;
      return data as ChapterProgress[];
    },
    enabled: !!courseId && chapterIds.length > 0,
  });
};

export const useToggleChapterComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chapterId, courseId, isCompleted }: { chapterId: string; courseId: string; isCompleted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isCompleted) {
        // Upsert as completed
        const { error } = await supabase
          .from("chapter_progress")
          .upsert(
            { user_id: user.id, chapter_id: chapterId, is_completed: true, completed_at: new Date().toISOString() },
            { onConflict: "user_id,chapter_id" }
          );
        if (error) throw error;
      } else {
        // Update to not completed
        const { error } = await supabase
          .from("chapter_progress")
          .update({ is_completed: false, completed_at: null })
          .eq("chapter_id", chapterId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["chapter-progress", courseId] });
    },
  });
};
