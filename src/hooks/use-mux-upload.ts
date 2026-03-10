import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FUNCTION_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/mux-video`;

async function callMux(action: string, params: Record<string, string> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action, ...params }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Mux request failed");
  return data;
}

type UploadState = "idle" | "uploading" | "processing" | "ready" | "error";

export function useMuxUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = undefined;
    }
  }, []);

  const pollForReady = useCallback(
    (uploadId: string, onReady: (playbackId: string) => void) => {
      setState("processing");
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const upload = await callMux("check-upload", { upload_id: uploadId });
          if (upload.asset_id) {
            const asset = await callMux("get-asset", { asset_id: upload.asset_id });
            if (asset.status === "ready" && asset.playback_id) {
              clearPoll();
              setState("ready");
              onReady(asset.playback_id);
              return;
            }
          }
          if (attempts > 120) {
            clearPoll();
            setState("error");
            toast.error("Video processing timed out");
          }
        } catch {
          clearPoll();
          setState("error");
          toast.error("Error checking video status");
        }
      }, 3000);
    },
    [clearPoll]
  );

  const upload = useCallback(
    async (file: File, onReady: (playbackId: string) => void) => {
      try {
        setState("uploading");
        setProgress(0);

        // 1. Get direct upload URL from Mux
        const { upload_url, upload_id } = await callMux("create-upload");

        // 2. Upload file directly to Mux using PUT
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // 3. Poll for asset readiness
        pollForReady(upload_id, onReady);
      } catch (err: unknown) {
        setState("error");
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [pollForReady]
  );

  const deleteAsset = useCallback(async (playbackId: string) => {
    // We don't have asset_id stored, but for cleanup we can skip this
    // In production you'd store asset_id too
  }, []);

  return { upload, state, progress, deleteAsset, clearPoll };
}
