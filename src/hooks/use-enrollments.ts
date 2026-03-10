import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface EnrollmentWithProfile extends Enrollment {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const useMyEnrollments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!user,
  });
};

export const useIsEnrolled = (courseId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollment", user?.id, courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", user!.id)
        .eq("course_id", courseId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return { enrolled: false, status: null as EnrollmentStatus | null };
      return { enrolled: true, status: (data.status || "active") as EnrollmentStatus };
    },
    enabled: !!user && !!courseId,
  });
};

export const useEnroll = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from("enrollments")
        .insert({ user_id: user!.id, course_id: courseId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-enrollment"] });
    },
  });
};

export const useTeacherEnrollments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["teacher-enrollment-stats", user?.id],
    queryFn: async () => {
      // Get teacher's courses first
      const { data: courses, error: cErr } = await supabase
        .from("courses")
        .select("id, title")
        .eq("teacher_id", user!.id);
      if (cErr) throw cErr;
      if (!courses?.length) return [];

      const courseIds = courses.map((c) => c.id);
      const { data: enrollments, error: eErr } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courseIds);
      if (eErr) throw eErr;

      // Fetch profiles for enrolled users
      const userIds = [...new Set((enrollments || []).map((e) => e.user_id))];
      let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]));
        }
      }

      return (enrollments || []).map((e) => ({
        ...e,
        profiles: profileMap[e.user_id] ?? null,
        course_title: courses.find((c) => c.id === e.course_id)?.title ?? "Unknown",
      }));
    },
    enabled: !!user,
  });
};

export type EnrollmentStatus = "active" | "suspended" | "banned";

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ enrollmentId, status }: { enrollmentId: string; status: EnrollmentStatus }) => {
      const { error } = await supabase
        .from("enrollments")
        .update({ status })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-enrollment-stats"] });
    },
  });
};
