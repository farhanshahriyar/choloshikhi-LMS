import { useTeacherCourses } from "@/hooks/use-courses";
import { useTeacherEnrollments } from "@/hooks/use-enrollments";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";

const TeacherAnalytics = () => {
  const { data: courses = [] } = useTeacherCourses();
  const { data: enrollments = [] } = useTeacherEnrollments();

  const data = courses.map((c) => {
    const enrollCount = enrollments.filter((e: { course_id: string }) => e.course_id === c.id).length;
    return {
      name: c.title.length > 18 ? c.title.slice(0, 18) + "…" : c.title,
      revenue: enrollCount * (c.price ?? 0),
      enrollments: enrollCount,
    };
  });

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalSales = enrollments.length;

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300">
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
            <p className="text-3xl font-bold text-foreground">{totalSales}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6" style={{ height: 400 }}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={80} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data yet. Create and publish courses to see analytics.
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
};

export default TeacherAnalytics;
