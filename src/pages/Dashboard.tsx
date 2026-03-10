import { Clock, CheckCircle } from "lucide-react";
import { usePublishedCourses } from "@/hooks/use-courses";
import { useMyEnrollments } from "@/hooks/use-enrollments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { getOptimizedImageUrl, COURSE_CARD_SIZES } from "@/lib/image-utils";

const Dashboard = () => {
  const { data: enrollments = [] } = useMyEnrollments();
  const { data: courses = [] } = usePublishedCourses();

  const enrolledCourses = courses.filter((c) =>
    enrollments.some((e) => e.course_id === c.id)
  );

  const enrolledCourseIds = enrolledCourses.map((c) => c.id);

  // Fetch all chapters for enrolled courses
  const { data: allChapters = [] } = useQuery({
    queryKey: ["dashboard-chapters", enrolledCourseIds],
    queryFn: async () => {
      if (enrolledCourseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("chapters")
        .select("id, course_id")
        .in("course_id", enrolledCourseIds)
        .eq("is_published", true);
      if (error) throw error;
      return data;
    },
    enabled: enrolledCourseIds.length > 0,
  });

  const allChapterIds = allChapters.map((ch) => ch.id);

  // Fetch progress for all those chapters
  const { data: allProgress = [] } = useQuery({
    queryKey: ["dashboard-progress", allChapterIds],
    queryFn: async () => {
      if (allChapterIds.length === 0) return [];
      const { data, error } = await supabase
        .from("chapter_progress")
        .select("chapter_id, is_completed")
        .in("chapter_id", allChapterIds)
        .eq("is_completed", true);
      if (error) throw error;
      return data;
    },
    enabled: allChapterIds.length > 0,
  });

  const completedSet = new Set(allProgress.map((p) => p.chapter_id));

  const getCourseProgress = (courseId: string) => {
    const chapters = allChapters.filter((ch) => ch.course_id === courseId);
    if (chapters.length === 0) return 0;
    const completed = chapters.filter((ch) => completedSet.has(ch.id)).length;
    return Math.round((completed / chapters.length) * 100);
  };

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Enrolled Courses</p>
              <p className="text-sm text-muted-foreground">{enrolledCourses.length} Courses</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Available Courses</p>
              <p className="text-sm text-muted-foreground">{courses.length} Courses</p>
            </div>
          </div>
        </div>

        {enrolledCourses.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {enrolledCourses.map((course) => {
                const progress = getCourseProgress(course.id);
                return (
                  <Link key={course.id} to={`/course/${course.id}`} className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-300">
                    {course.image_url ? (
                      <img src={getOptimizedImageUrl(course.image_url, { width: 480 })} alt={course.title} className="w-full aspect-video object-cover" loading="lazy" sizes={COURSE_CARD_SIZES} />
                    ) : (
                      <div className="w-full aspect-video bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{course.category || "Uncategorized"}</p>
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{course.title}</h3>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{progress}% Complete</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        {progress === 100 && (
                          <p className="text-xs font-medium text-primary mt-1">✓ Completed</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/browse" className="text-primary hover:underline mt-2 inline-block">Browse courses</Link>
          </div>
        )}
      </main>
    </PageTransition>
  );
};

export default Dashboard;
