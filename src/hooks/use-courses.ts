import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Course {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useTeacherCourses = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["teacher-courses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
    enabled: !!user,
  });
};

export const usePublishedCourses = () => {
  return useQuery({
    queryKey: ["published-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId!)
        .single();
      if (error) throw error;
      return data as Course;
    },
    enabled: !!courseId,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("courses")
        .insert({ teacher_id: user!.id, title })
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", data.id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
  });
};

export interface PublicCourseDetail {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  price: number | null;
  created_at: string;
  teacher_name: string;
  chapter_count: number;
}

export const usePublicCourseDetail = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["public-course-detail", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_course_detail", {
        _course_id: courseId!,
      });
      if (error) throw error;
      return data as unknown as PublicCourseDetail;
    },
    enabled: !!courseId,
  });
};
