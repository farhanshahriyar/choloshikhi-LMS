import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { usePublicCourseDetail } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

const PublicCoursePreview = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading, error } = usePublicCourseDetail(courseId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">CholoShikhi</span>
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Skeleton className="mb-6 h-8 w-48" />
          <Skeleton className="mb-8 aspect-video w-full rounded-2xl" />
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-2 h-5 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <h1 className="text-2xl font-bold text-foreground">Course not found</h1>
        <p className="mt-2 text-muted-foreground">This course may not be published or doesn't exist.</p>
        <Button asChild className="mt-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">CholoShikhi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <motion.div
        className="mx-auto max-w-5xl px-6 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Image */}
            {course.image_url && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-border">
                <img
                  src={getOptimizedImageUrl(course.image_url, { width: 800 })}
                  alt={course.title}
                  className="aspect-video w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {course.category && (
                <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                  {course.category}
                </Badge>
              )}
              {course.price && course.price > 0 ? (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <DollarSign className="mr-1 h-3 w-3" />
                  {course.price}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Free
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {course.title}
            </h1>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {course.teacher_name}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {course.chapter_count} {course.chapter_count === 1 ? "chapter" : "chapters"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(course.created_at), "MMM d, yyyy")}
              </span>
            </div>

            {/* Description */}
            {course.description && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-foreground">About this course</h2>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Ready to start learning?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a free account to enroll in this course and start your journey.
              </p>

              <div className="mt-6 space-y-3">
                <Button size="lg" className="w-full" asChild>
                  <Link to="/auth">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/">Browse All Courses</Link>
                </Button>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Instructor</span>
                  <span className="font-medium text-foreground">{course.teacher_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chapters</span>
                  <span className="font-medium text-foreground">{course.chapter_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price</span>
                  <span className="font-medium text-foreground">
                    {course.price && course.price > 0 ? `$${course.price}` : "Free"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">CholoShikhi</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CholoShikhi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicCoursePreview;
