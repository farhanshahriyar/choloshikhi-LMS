import { useState } from "react";
import { Users, BookOpen, ShieldCheck, ShieldBan, ShieldAlert } from "lucide-react";
import { useTeacherEnrollments, useUpdateEnrollmentStatus, type EnrollmentStatus } from "@/hooks/use-enrollments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<EnrollmentStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof ShieldCheck }> = {
  active: { label: "Active", variant: "default", icon: ShieldCheck },
  suspended: { label: "Suspended", variant: "secondary", icon: ShieldAlert },
  banned: { label: "Banned", variant: "destructive", icon: ShieldBan },
};

const TeacherEnrollments = () => {
  const { data: enrollments = [], isLoading } = useTeacherEnrollments();
  const updateStatus = useUpdateEnrollmentStatus();
  const [filterCourse, setFilterCourse] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    enrollmentId: string;
    status: EnrollmentStatus;
    studentName: string;
    studentEmail: string | null;
    courseTitle: string;
  } | null>(null);

  type EnrollmentItem = { id: string; course_title: string; status?: string; created_at: string; profiles?: { full_name: string | null; email: string | null } | null };
  const courses = [...new Set(enrollments.map((e: EnrollmentItem) => e.course_title))];
  const filtered = filterCourse
    ? enrollments.filter((e: EnrollmentItem) => e.course_title === filterCourse)
    : enrollments;

  const handleStatusChange = (
    enrollmentId: string,
    status: EnrollmentStatus,
    studentName: string,
    studentEmail: string | null,
    courseTitle: string
  ) => {
    // Activating doesn't need confirmation
    if (status === "active") {
      executeStatusChange(enrollmentId, status, studentName, studentEmail, courseTitle);
      return;
    }
    setConfirmAction({ enrollmentId, status, studentName, studentEmail, courseTitle });
  };

  const executeStatusChange = async (
    enrollmentId: string,
    status: EnrollmentStatus,
    studentName: string,
    studentEmail: string | null,
    courseTitle: string
  ) => {
    try {
      await updateStatus.mutateAsync({ enrollmentId, status });
      toast.success(`Student ${statusConfig[status].label.toLowerCase()} successfully`);

      // Send email notification
      if (studentEmail) {
        const subjectMap: Record<EnrollmentStatus, string> = {
          active: `Your access to "${courseTitle}" has been restored`,
          suspended: `Your access to "${courseTitle}" has been suspended`,
          banned: `You have been banned from "${courseTitle}"`,
        };
        const bodyMap: Record<EnrollmentStatus, string> = {
          active: `Hi ${studentName}, your enrollment in "${courseTitle}" is now active again. You can continue learning.`,
          suspended: `Hi ${studentName}, your access to "${courseTitle}" has been temporarily suspended. Please contact your instructor for more information.`,
          banned: `Hi ${studentName}, you have been banned from "${courseTitle}". If you believe this is a mistake, please contact your instructor.`,
        };

        supabase.functions.invoke("send-notification", {
          body: {
            to: studentEmail,
            subject: subjectMap[status],
            body: bodyMap[status],
            type: "enrollment_status_change",
          },
        }).catch(() => {
          // Silent fail - notification is best-effort
        });
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const onConfirm = () => {
    if (confirmAction) {
      executeStatusChange(
        confirmAction.enrollmentId,
        confirmAction.status,
        confirmAction.studentName,
        confirmAction.studentEmail,
        confirmAction.courseTitle
      );
      setConfirmAction(null);
    }
  };

  return (
    <PageTransition>
      <TopBar />
      <main className="flex-1 p-6 overflow-auto animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{enrollments.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Courses with Students</p>
                <p className="text-3xl font-bold text-foreground">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No enrollments yet</TableCell></TableRow>
              ) : filtered.map((e: EnrollmentItem) => {
                const status = (e.status || "active") as EnrollmentStatus;
                const config = statusConfig[status];
                const StatusIcon = config.icon;
                const studentName = e.profiles?.full_name || "Unknown";
                const studentEmail = e.profiles?.email || null;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{studentName}</TableCell>
                    <TableCell>{studentEmail || "—"}</TableCell>
                    <TableCell>{e.course_title}</TableCell>
                    <TableCell>{new Date(e.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Manage</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {status !== "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(e.id, "active", studentName, studentEmail, e.course_title)}>
                              <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {status !== "suspended" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(e.id, "suspended", studentName, studentEmail, e.course_title)}>
                              <ShieldAlert className="w-4 h-4 mr-2 text-yellow-500" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {status !== "banned" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(e.id, "banned", studentName, studentEmail, e.course_title)} className="text-destructive">
                              <ShieldBan className="w-4 h-4 mr-2" />
                              Ban
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.status === "suspended" ? "Suspend Student?" : "Ban Student?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.status === "suspended"
                  ? `This will temporarily revoke ${confirmAction.studentName}'s access to "${confirmAction.courseTitle}". They won't be able to view course content until reactivated.`
                  : `This will permanently ban ${confirmAction?.studentName} from "${confirmAction?.courseTitle}". They will lose all access to the course content.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className={confirmAction?.status === "banned" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              >
                {confirmAction?.status === "suspended" ? "Suspend" : "Ban"} Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </PageTransition>
  );
};

export default TeacherEnrollments;
