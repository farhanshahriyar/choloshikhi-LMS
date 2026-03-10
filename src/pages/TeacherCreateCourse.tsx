import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { useCreateCourse } from "@/hooks/use-courses";
import { toast } from "sonner";

const TeacherCreateCourse = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const createCourse = useCreateCourse();

  const handleContinue = async () => {
    if (!title.trim()) return;
    try {
      const course = await createCourse.mutateAsync(title.trim());
      toast.success("Course created");
      navigate(`/teacher/course/${course.id}`);
    } catch {
      toast.error("Failed to create course");
    }
  };

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Name your course</h1>
            <p className="text-sm text-muted-foreground mt-1">
              What would you like to name your course? Don't worry, you can always change this later.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Course title</label>
            <input
              type="text"
              placeholder="e.g. 'Advanced Web Development'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">What will you teach in this course?</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/teacher/courses")}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={!title.trim() || createCourse.isPending}>
              {createCourse.isPending ? "Creating..." : "Continue"}
            </Button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default TeacherCreateCourse;
