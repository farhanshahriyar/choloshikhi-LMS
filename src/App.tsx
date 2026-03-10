import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ModeProvider } from "@/contexts/ModeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import MainLayout from "./layouts/MainLayout";
import { lazy, Suspense, useState } from "react";

// Eagerly load the landing page (initial route)
import Landing from "./pages/Landing";

// Lazy load all other routes
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Browse = lazy(() => import("./pages/Browse"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const TeacherCourses = lazy(() => import("./pages/TeacherCourses"));
const TeacherAnalytics = lazy(() => import("./pages/TeacherAnalytics"));
const TeacherCourseSetup = lazy(() => import("./pages/TeacherCourseSetup"));
const TeacherChapterEdit = lazy(() => import("./pages/TeacherChapterEdit"));
const TeacherCreateCourse = lazy(() => import("./pages/TeacherCreateCourse"));
const TeacherQuizEdit = lazy(() => import("./pages/TeacherQuizEdit"));
const TeacherEnrollments = lazy(() => import("./pages/TeacherEnrollments"));
const About = lazy(() => import("./pages/About"));
const PublicCoursePreview = lazy(() => import("./pages/PublicCoursePreview"));
const PublicBrowse = lazy(() => import("./pages/PublicBrowse"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/course-preview/:courseId" element={<PublicCoursePreview />} />
          <Route path="/courses" element={<PublicBrowse />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/teacher/courses" element={<RoleGuard role="teacher"><TeacherCourses /></RoleGuard>} />
            <Route path="/teacher/create" element={<RoleGuard role="teacher"><TeacherCreateCourse /></RoleGuard>} />
            <Route path="/teacher/analytics" element={<RoleGuard role="teacher"><TeacherAnalytics /></RoleGuard>} />
            <Route path="/teacher/enrollments" element={<RoleGuard role="teacher"><TeacherEnrollments /></RoleGuard>} />
            <Route path="/teacher/course/:courseId" element={<RoleGuard role="teacher"><TeacherCourseSetup /></RoleGuard>} />
            <Route path="/teacher/course/:courseId/chapter/:chapterId" element={<RoleGuard role="teacher"><TeacherChapterEdit /></RoleGuard>} />
            <Route path="/teacher/course/:courseId/chapter/:chapterId/quiz" element={<RoleGuard role="teacher"><TeacherQuizEdit /></RoleGuard>} />
          </Route>
          <Route path="/course/:courseId" element={
            <ProtectedRoute><CourseDetail /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <ModeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </ModeProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
