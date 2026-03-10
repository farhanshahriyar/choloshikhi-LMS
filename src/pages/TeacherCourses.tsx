import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, Pencil, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTeacherCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";

type SortKey = "title" | "price" | "status";
type SortDir = "asc" | "desc";

const TeacherCourses = () => {
  const navigate = useNavigate();
  const { data: courses = [], isLoading } = useTeacherCourses();
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = courses
    .filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "price") cmp = (a.price ?? 0) - (b.price ?? 0);
      else cmp = Number(a.is_published) - Number(b.is_published);
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto animate-fade-in">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center justify-between mb-6"
        >
          <input
            type="text"
            placeholder="Filter courses..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-w-xs transition-shadow duration-200"
          />
          <Button onClick={() => navigate("/teacher/create")} className="transition-transform duration-150 active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> New course
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="rounded-lg border border-border bg-card overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none transition-colors duration-150 hover:text-foreground" onClick={() => toggleSort("title")}>
                  <span className="inline-flex items-center gap-1">Title <ArrowUpDown className="w-3 h-3 transition-transform duration-200" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none transition-colors duration-150 hover:text-foreground" onClick={() => toggleSort("price")}>
                  <span className="inline-flex items-center gap-1">Price <ArrowUpDown className="w-3 h-3 transition-transform duration-200" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none transition-colors duration-150 hover:text-foreground" onClick={() => toggleSort("status")}>
                  <span className="inline-flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3 transition-transform duration-200" /></span>
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No courses yet</TableCell></TableRow>
              ) : filtered.map((course, index) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 * index }}
                  className="border-b transition-colors duration-200 hover:bg-muted/50 group"
                >
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${(course.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={course.is_published
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/90"
                    }>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/teacher/course/${course.id}`)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default TeacherCourses;
