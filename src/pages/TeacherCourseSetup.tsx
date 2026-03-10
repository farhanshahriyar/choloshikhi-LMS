import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Plus, GripVertical, Trash2, LayoutGrid, ListChecks, DollarSign, Paperclip, X, ImageIcon } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/lib/mock-data";
import { useCourse, useUpdateCourse, useDeleteCourse } from "@/hooks/use-courses";
import { useCourseChapters, useCreateChapter, useReorderChapters, type Chapter } from "@/hooks/use-chapters";
import { useCourseAttachments, useUploadAttachment, useDeleteAttachment } from "@/hooks/use-attachments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface SortableChapterProps {
  chapter: Chapter;
  courseId: string;
  onEdit: (chapterId: string) => void;
}

const SortableChapter = ({ chapter, courseId, onEdit }: SortableChapterProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 rounded-md bg-background border border-border transition-shadow duration-200 hover:shadow-sm">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <span className="flex-1 text-sm text-primary">{chapter.title}</span>
      {chapter.is_free && <Badge variant="outline" className="text-xs border-primary text-primary">Free</Badge>}
      <Badge className={`text-xs transition-colors duration-150 ${chapter.is_published ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {chapter.is_published ? "Published" : "Draft"}
      </Badge>
      <button onClick={() => onEdit(chapter.id)} className="text-muted-foreground hover:text-foreground transition-colors duration-150">
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
};

const AttachmentsSection = ({ courseId }: { courseId: string }) => {
  const { data: attachments = [] } = useCourseAttachments(courseId);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment.mutateAsync({ courseId, file });
      toast.success("Attachment uploaded");
    } catch {
      toast.error("Upload failed");
    }
    e.target.value = "";
  };

  const handleDelete = async (att: { id: string; url: string }) => {
    try {
      await deleteAttachment.mutateAsync({ id: att.id, courseId, url: att.url });
      toast.success("Attachment removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div>
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-4">
        <Paperclip className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Resources & Attachments</h2>
      </motion.div>
      <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Course attachments</p>
          <label className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150 cursor-pointer">
            <Plus className="w-3 h-3" /> Add a file
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        {uploadAttachment.isPending && (
          <p className="text-xs text-muted-foreground mb-2">Uploading...</p>
        )}
        <AnimatePresence>
          {attachments.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-2 rounded-md bg-background border border-border mb-1 transition-shadow duration-200 hover:shadow-sm"
            >
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1">
                {a.name}
              </a>
              <button onClick={() => handleDelete(a)} className="text-muted-foreground hover:text-destructive transition-colors duration-150 ml-2">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {attachments.length === 0 && !uploadAttachment.isPending && (
          <p className="text-sm text-muted-foreground">No attachments yet</p>
        )}
      </motion.div>
    </div>
  );
};

const TeacherCourseSetup = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: dbChapters = [] } = useCourseChapters(courseId);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createChapter = useCreateChapter();
  const reorderChapters = useReorderChapters();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [showAddChapter, setShowAddChapter] = useState(false);

  // Sync from DB
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description ?? "");
      setPrice(course.price ?? 0);
      setCategory(course.category ?? "");
      setCourseImage(course.image_url);
    }
  }, [course]);

  useEffect(() => {
    setChapters(dbChapters);
  }, [dbChapters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        reorderChapters.mutate(reordered.map((ch, i) => ({ id: ch.id, position: i, course_id: courseId! })));
        return reordered;
      });
    }
  };

  const saveField = async (field: string) => {
    if (!courseId) return;
    const updates: Record<string, string | number | boolean | null> = {};
    if (field === "title") updates.title = title;
    if (field === "desc") updates.description = description;
    if (field === "price") updates.price = price;
    if (field === "cat") updates.category = category;
    try {
      await updateCourse.mutateAsync({ id: courseId, ...updates });
      toast.success("Saved");
    } catch { toast.error("Failed to save"); }
    setEditingField(null);
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim() || !courseId) return;
    try {
      await createChapter.mutateAsync({ course_id: courseId, title: newChapterTitle.trim(), position: chapters.length });
      setNewChapterTitle("");
      setShowAddChapter(false);
      toast.success("Chapter added");
    } catch { toast.error("Failed to add chapter"); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !courseId) return;
    const path = `${user.id}/${courseId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("course-assets").upload(path, file);
    if (error) { toast.error("Upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("course-assets").getPublicUrl(path);
    await updateCourse.mutateAsync({ id: courseId, image_url: publicUrl });
    setCourseImage(publicUrl);
    setEditingField(null);
    toast.success("Image uploaded");
  };

  const handlePublishToggle = async () => {
    if (!courseId || !course) return;
    if (!course.is_published) {
      const publishedChapters = chapters.filter(ch => ch.is_published);
      if (!title || !description || publishedChapters.length === 0) {
        toast.error("Complete title, description, and publish at least one chapter first");
        return;
      }
    }
    await updateCourse.mutateAsync({ id: courseId, is_published: !course.is_published });
    toast.success(course.is_published ? "Course unpublished" : "Course published!");
  };

  const handleDelete = async () => {
    if (!courseId) return;
    await deleteCourse.mutateAsync(courseId);
    toast.success("Course deleted");
    navigate("/teacher/courses");
  };

  if (isLoading) return <PageTransition><TopBar /><main className="flex-1 p-6 flex items-center justify-center text-muted-foreground">Loading...</main></PageTransition>;
  if (!course) return <div className="p-6">Course not found</div>;

  const totalFields = 6;
  const completedFields = [title, description, courseImage, chapters.length > 0, price > 0, category].filter(Boolean).length;

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Course setup</h1>
            <p className="text-sm text-muted-foreground">Complete all fields ({completedFields}/{totalFields})</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePublishToggle} className="transition-transform duration-150 active:scale-95">
              {course.is_published ? "Unpublish" : "Publish"}
            </Button>
            <Button variant="outline" size="icon" onClick={handleDelete} className="transition-transform duration-150 active:scale-95"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-2">
              <LayoutGrid className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Customize your course</h2>
            </motion.div>

            {/* Title */}
            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Course title</p>
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
                <p className="text-sm font-medium text-foreground">Course description</p>
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
                  <motion.div key="view-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rich-text text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description || "No description") }} />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Image */}
            <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Course image</p>
                <button onClick={() => setEditingField(editingField === "image" ? null : "image")} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                  {courseImage ? <><Pencil className="w-3 h-3" /> Edit image</> : <><Plus className="w-3 h-3" /> Add an image</>}
                </button>
              </div>
              <AnimatePresence>
                {editingField === "image" && (
                  <motion.div variants={expandVariants} initial="initial" animate="animate" exit="exit" className="mb-3 overflow-hidden">
                    <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors duration-200">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Choose files or drag and drop</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
              {courseImage ? (
                <motion.img initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} src={courseImage} alt={title} className="w-full rounded-md aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                </div>
              )}
            </motion.div>

            {/* Category */}
            <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Course category</p>
                <button onClick={() => setEditingField(editingField === "cat" ? null : "cat")} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                  <Pencil className="w-3 h-3" /> {editingField === "cat" ? "Cancel" : "Edit category"}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {editingField === "cat" ? (
                  <motion.div key="edit-cat" variants={expandVariants} initial="initial" animate="animate" exit="exit" className="space-y-2 overflow-hidden">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm transition-shadow duration-200 focus:ring-2 focus:ring-ring focus:outline-none">
                      <option value="">Select option...</option>
                      {categories.map((cat) => (<option key={cat.name} value={cat.name}>{cat.name}</option>))}
                    </select>
                    <Button size="sm" onClick={() => saveField("cat")} className="transition-transform duration-150 active:scale-95">Save</Button>
                  </motion.div>
                ) : (
                  <motion.p key="view-cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-sm text-muted-foreground">{category || "No category"}</motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Chapters */}
            <div>
              <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-4">
                <ListChecks className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Course chapters</h2>
              </motion.div>
              <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Course chapters</p>
                  <button onClick={() => setShowAddChapter(!showAddChapter)} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                    <Plus className="w-3 h-3" /> Add a chapter
                  </button>
                </div>
                <AnimatePresence>
                  {showAddChapter && (
                    <motion.div variants={expandVariants} initial="initial" animate="animate" exit="exit" className="mb-3 space-y-2 overflow-hidden">
                      <input type="text" placeholder="e.g. 'Introduction'" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm transition-shadow duration-200 focus:ring-2 focus:ring-ring focus:outline-none" />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleAddChapter} disabled={!newChapterTitle.trim() || createChapter.isPending} className="transition-transform duration-150 active:scale-95">Create</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowAddChapter(false); setNewChapterTitle(""); }}>Cancel</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={chapters.map((ch) => ch.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {chapters.map((ch, i) => (
                          <motion.div key={ch.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
                            <SortableChapter chapter={ch} courseId={courseId!} onEdit={(chId) => navigate(`/teacher/course/${courseId}/chapter/${chId}`)} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
                {chapters.length === 0 && <p className="text-sm text-muted-foreground">No chapters yet</p>}
                <p className="text-xs text-muted-foreground mt-2">Drag and drop to reorder chapters</p>
              </motion.div>
            </div>

            {/* Price */}
            <div>
              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-primary mb-4">
                <DollarSign className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Sell your course</h2>
              </motion.div>
              <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Course price</p>
                  <button onClick={() => setEditingField(editingField === "price" ? null : "price")} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                    <Pencil className="w-3 h-3" /> {editingField === "price" ? "Cancel" : "Edit price"}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {editingField === "price" ? (
                    <motion.div key="edit-price" variants={expandVariants} initial="initial" animate="animate" exit="exit" className="space-y-2 overflow-hidden">
                      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm transition-shadow duration-200 focus:ring-2 focus:ring-ring focus:outline-none" />
                      <Button size="sm" onClick={() => saveField("price")} className="transition-transform duration-150 active:scale-95">Save</Button>
                    </motion.div>
                  ) : (
                    <motion.p key="view-price" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-sm text-muted-foreground">${price.toFixed(2)}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Attachments */}
            <AttachmentsSection courseId={courseId!} />
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default TeacherCourseSetup;
