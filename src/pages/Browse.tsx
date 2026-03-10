import { useState, useMemo } from "react";
import { usePublishedCourses } from "@/hooks/use-courses";
import CategoryFilter from "@/components/CategoryFilter";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { getOptimizedImageUrl, COURSE_CARD_SIZES } from "@/lib/image-utils";

const Browse = () => {
  const { data: courses = [], isLoading } = usePublishedCourses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesCategory = !selectedCategory || c.category === selectedCategory;
      const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, search]);

  return (
    <PageTransition>
      <TopBar showSearch searchValue={search} onSearchChange={setSearch} />
      <main className="flex-1 p-6 overflow-auto animate-fade-in">
        <div className="mb-6">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
        {isLoading ? (
          <p className="text-center text-muted-foreground mt-12">Loading courses...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
            {filtered.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="group block animate-fade-in">
                <div className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    {course.image_url ? (
                      <img src={getOptimizedImageUrl(course.image_url, { width: 480 })} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" sizes={COURSE_CARD_SIZES} />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{course.category || "Uncategorized"}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {course.price != null && course.price > 0 ? `$${Number(course.price).toFixed(2)}` : "Free"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">No courses found.</p>
        )}
      </main>
    </PageTransition>
  );
};

export default Browse;
