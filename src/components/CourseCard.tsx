import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "@/lib/mock-data";
import { getOptimizedImageUrl, COURSE_CARD_SIZES } from "@/lib/image-utils";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link to={`/course/${course.id}`} className="group block animate-fade-in">
      <div className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="aspect-video overflow-hidden">
          <img
            src={getOptimizedImageUrl(course.image, { width: 480 })}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            sizes={COURSE_CARD_SIZES}
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{course.category}</p>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs">{course.chapters.length} Chapters</span>
          </div>
          {course.enrolled ? (
            <div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-progress rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <p className={`text-xs font-medium ${course.progress === 100 ? "text-success" : "text-progress"}`}>
                {course.progress}% Complete
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-foreground">
              {course.price ? `$${course.price.toFixed(2)}` : "Free"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
