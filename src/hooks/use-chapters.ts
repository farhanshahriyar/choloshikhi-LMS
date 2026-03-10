import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  is_published: boolean;
  is_free: boolean;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useCourseChapters = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["chapters", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!courseId,
  });
};

export const useChapter = (chapterId: string | undefined) => {
  return useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId!)
        .single();
      if (error) throw error;
      return data as Chapter;
    },
    enabled: !!chapterId,
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ course_id, title, position }: { course_id: string; title: string; position: number }) => {
      const { data, error } = await supabase
        .from("chapters")
        .insert({ course_id, title, position })
        .select()
        .single();
      if (error) throw error;
      return data as Chapter;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", data.course_id] });
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Chapter> & { id: string }) => {
      const { data, error } = await supabase
        .from("chapters")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Chapter;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["chapter", data.id] });
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, course_id }: { id: string; course_id: string }) => {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
      return course_id;
    },
    onSuccess: (course_id) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", course_id] });
    },
  });
};

export const useReorderChapters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapters: { id: string; position: number; course_id: string }[]) => {
      await Promise.all(
        chapters.map(async (ch) => {
          const { error } = await supabase
            .from("chapters")
            .update({ position: ch.position })
            .eq("id", ch.id);
          if (error) throw error;
        })
      );
      return chapters[0]?.course_id;
    },
    onSuccess: (course_id) => {
      if (course_id) {
        queryClient.invalidateQueries({ queryKey: ["chapters", course_id] });
      }
    },
  });
};
