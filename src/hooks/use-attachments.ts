import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Attachment {
  id: string;
  course_id: string;
  name: string;
  url: string;
  created_at: string;
}

export const useCourseAttachments = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["attachments", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_attachments")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Attachment[];
    },
    enabled: !!courseId,
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ courseId, file }: { courseId: string; file: File }) => {
      const path = `${user!.id}/${courseId}/attachments/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("course-assets")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-assets")
        .getPublicUrl(path);

      const { data, error } = await supabase
        .from("course_attachments")
        .insert({ course_id: courseId, name: file.name, url: publicUrl })
        .select()
        .single();
      if (error) throw error;
      return data as Attachment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", data.course_id] });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, url }: { id: string; courseId: string; url: string }) => {
      // Extract storage path from URL
      const bucketUrl = supabase.storage.from("course-assets").getPublicUrl("").data.publicUrl;
      const storagePath = url.replace(bucketUrl, "");
      if (storagePath) {
        await supabase.storage.from("course-assets").remove([storagePath]);
      }
      const { error } = await supabase.from("course_attachments").delete().eq("id", id);
      if (error) throw error;
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", courseId] });
    },
  });
};
