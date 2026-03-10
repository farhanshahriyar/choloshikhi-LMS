import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Video, Eye, Trash2, Upload, BookOpen, Loader2, CheckCircle } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { motion, AnimatePresence } from "framer-motion";
import { useChapter, useUpdateChapter, useDeleteChapter } from "@/hooks/use-chapters";
import { useChapterQuiz } from "@/hooks/use-quizzes";
import { useMuxUpload } from "@/hooks/use-mux-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: i * 0.07 },
  }),
};

const expandVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" as const, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: [0.55, 0.09, 0.68, 0.53] as const } },
};

const MUX_STREAM_URL = "https://stream.mux.com";

const TeacherChapterEdit = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { data: chapter, isLoading } = useChapter(chapterId);
  const { data: quiz } = useChapterQuiz(chapterId);
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();
  const { upload: muxUpload, state: uploadState, progress: uploadProgress, clearPoll } = useMuxUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setDescription(chapter.description ?? "");
      setIsFree(chapter.is_free);
    }
  }, [chapter]);

  useEffect(() => () => clearPoll(), [clearPoll]);

  const saveField = async (field: string) => {
    if (!chapterId) return;
    const updates: Record<string, string | boolean | null> = {};
    if (field === "title") updates.title = title;
    if (field === "desc") updates.description = description;
    if (field === "access") updates.is_free = isFree;
    try {
      await updateChapter.mutateAsync({ id: chapterId, ...updates });
      toast.success("Saved");
    } catch { toast.error("Failed to save"); }
    setEditingField(null);
  };

  const handlePublish = async () => {
    if (!chapterId || !chapter) return;
    if (!chapter.is_published && (!title || !description)) {
      toast.error("Fill in title and description before publishing");
      return;
    }
    await updateChapter.mutateAsync({ id: chapterId, is_published: !chapter.is_published });
    toast.success(chapter.is_published ? "Chapter unpublished" : "Chapter published!");
  };

  const handleDelete = async () => {
    if (!chapterId || !courseId) return;
    await deleteChapter.mutateAsync({ id: chapterId, course_id: courseId });
    toast.success("Chapter deleted");
    navigate(`/teacher/course/${courseId}`);
  };

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    muxUpload(file, async (playbackId) => {
      if (!chapterId) return;
      await updateChapter.mutateAsync({ id: chapterId, video_url: playbackId });
      toast.success("Video uploaded and ready!");
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleVideoUpload(file);
  };

  const handleRemoveVideo = async () => {
    if (!chapterId) return;
    await updateChapter.mutateAsync({ id: chapterId, video_url: null });
    toast.success("Video removed");
  };

  if (isLoading) return <PageTransition><TopBar /><main className="flex-1 p-6 flex items-center justify-center text-muted-foreground">Loading...</main></PageTransition>;
  if (!chapter) return <div className="p-6">Chapter not found</div>;

  const totalFields = 3;
  const completedFields = [title, description, true].filter(Boolean).length;
  const playbackId = chapter.video_url;

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto">
        {!chapter.is_published && (
          <div className="bg-warning/20 border-b border-warning/30 px-6 py-2 -mx-6 -mt-6 mb-4">
            <p className="text-sm text-warning-foreground font-medium">⚠️ This chapter is unpublished. It will not be visible in the course.</p>
          </div>
        )}

        <button onClick={() => navigate(`/teacher/course/${courseId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to course setup
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chapter creation</h1>
            <p className="text-sm text-muted-foreground">Complete all fields ({completedFields}/{totalFields})</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePublish} className="transition-transform duration-150 active:scale-95">
              {chapter.is_published ? "Unpublish" : "Publish"}
            </Button>
            <Button variant="outline" size="icon" onClick={handleDelete} className="transition-transform duration-150 active:scale-95"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-2">
              <Pencil className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Customize your chapter</h2>
            </motion.div>

            {/* Title */}
            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Chapter title</p>
                <button onClick={() => setEditingField(editingField === "title" ? null : "title")} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                  <Pencil className="w-3 h-3" /> {editingField === "title" ? "Cancel" : "Edit title"}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {editingField === "title" ? (
                  <motion.div key="edit-title" variants={expandVariants} initial="initial" animate="animate" exit="exit" className="space-y-2 overflow-hidden">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm transition-shadow duration-200 focus:ring-2 focus:ring-ring focus:outline-none" />
                    <Button size="sm" onClick={() => saveField("title")} className="transition-transform duration-150 active:scale-95">Save</Button>
                  </motion.div>
                ) : (
                  <motion.p key="view-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-sm text-muted-foreground">{title}</motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Description */}
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Chapter description</p>
                <button onClick={() => setEditingField(editingField === "desc" ? null : "desc")} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                  <Pencil className="w-3 h-3" /> {editingField === "desc" ? "Cancel" : "Edit description"}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {editingField === "desc" ? (
                  <motion.div key="edit-desc" variants={expandVariants} initial="initial" animate="animate" exit="exit" className="space-y-2 overflow-hidden">
                    <RichTextEditor value={description} onChange={setDescription} rows={4} />
                    <Button size="sm" onClick={() => saveField("desc")} className="transition-transform duration-150 active:scale-95">Save</Button>
                  </motion.div>
                ) : (
                  <motion.div key="view-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Objectives:</p>
                    <div className="rich-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description || "No description") }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Access settings */}
            <div>
              <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-4">
                <Eye className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Access Settings</h2>
              </motion.div>
              <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Free Preview Chapter</p>
                  <button onClick={() => setEditingField(editingField === "access" ? null : "access")} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                    {editingField === "access" ? "Cancel" : "Edit access settings"}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {editingField === "access" ? (
                    <motion.div key="edit-access" variants={expandVariants} initial="initial" animate="animate" exit="exit" className="space-y-3 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isFree} onCheckedChange={(v) => setIsFree(!!v)} id="free-preview" />
                        <label htmlFor="free-preview" className="text-sm text-muted-foreground">Check this box if you want to make this chapter free for preview</label>
                      </div>
                      <Button size="sm" onClick={() => saveField("access")} className="transition-transform duration-150 active:scale-95">Save</Button>
                    </motion.div>
                  ) : (
                    <motion.p key="view-access" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-sm text-muted-foreground">{isFree ? "This chapter is free for preview." : "This chapter is not free."}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-2">
              <Video className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Add a video</h2>
            </motion.div>

            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Chapter video</p>
                {playbackId && (
                  <button onClick={handleRemoveVideo} className="text-sm text-destructive flex items-center gap-1 hover:text-destructive/80 transition-colors duration-150">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              {playbackId ? (
                <div className="rounded-lg overflow-hidden bg-foreground aspect-video">
                  <MuxPlayer
                    playbackId={playbackId}
                    className="w-full h-full"
                  />
                </div>
              ) : uploadState === "uploading" || uploadState === "processing" ? (
                <div className="border-2 border-dashed border-primary/40 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-background">
                  <Loader2 className="w-10 h-10 text-primary mb-3 animate-spin" />
                  {uploadState === "uploading" ? (
                    <>
                      <p className="text-sm font-medium text-foreground mb-2">Uploading... {uploadProgress}%</p>
                      <Progress value={uploadProgress} className="w-48" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground mb-1">Processing video...</p>
                      <p className="text-xs text-muted-foreground">This may take a few minutes</p>
                    </>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center bg-background transition-colors duration-200 hover:border-primary/40 cursor-pointer"
                >
                  {uploadState === "ready" ? (
                    <CheckCircle className="w-10 h-10 text-success mb-3" />
                  ) : (
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  )}
                  <p className="text-sm text-primary font-medium">Choose files or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Video (MP4, MOV, WebM)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleVideoUpload(f);
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {playbackId ? "Video is ready for playback" : "Upload this chapter's video via Mux"}
              </p>
            </motion.div>

            {/* Quiz section */}
            <div>
              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-4">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Quiz</h2>
              </motion.div>
              <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
                {quiz ? (
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">{quiz.title}</p>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/course/${courseId}/chapter/${chapterId}/quiz`)}>
                      Edit Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">No quiz added yet</p>
                    <Button size="sm" onClick={() => navigate(`/teacher/course/${courseId}/chapter/${chapterId}/quiz`)}>
                      Create Quiz
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default TeacherChapterEdit;
