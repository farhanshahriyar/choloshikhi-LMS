import { useState } from "react";
import { getOptimizedImageUrl, COURSE_CARD_SIZES } from "@/lib/image-utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { usePublishedCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Play,
  Award,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Star,
  GraduationCap,
  Zap,
  Globe,
  Menu,
  X,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  {
    icon: Play,
    title: "Video Lessons",
    description:
      "Stream high-quality video content powered by Mux for seamless learning.",
  },
  {
    icon: BookOpen,
    title: "Structured Courses",
    description:
      "Organized chapters with rich text descriptions and attachments.",
  },
  {
    icon: Award,
    title: "Quizzes & Grading",
    description:
      "Auto-graded quizzes at the end of each chapter to test your knowledge.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual progress bars and chapter completion to keep you motivated.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Separate student and teacher experiences with secure permissions.",
  },
  {
    icon: Users,
    title: "Enrollment Management",
    description: "Teachers can manage, suspend, or ban enrollments with ease.",
  },
];

const stats = [
  { value: "500+", label: "Active Learners" },
  { value: "120+", label: "Video Lessons" },
  { value: "50+", label: "Courses" },
  { value: "98%", label: "Satisfaction" },
];

const testimonials = [
  {
    name: "Arif Rahman",
    role: "Computer Science Student",
    content:
      "CholoShikhi transformed the way I learn. The structured chapters and quizzes keep me on track, and the video quality is amazing.",
    rating: 5,
  },
  {
    name: "Fatima Akter",
    role: "Graphic Design Learner",
    content:
      "As a self-learner, this platform is a game-changer. The progress tracking feature motivates me to complete every course I start.",
    rating: 5,
  },
  {
    name: "Tanvir Hasan",
    role: "Teacher & Content Creator",
    content:
      "Creating courses is so intuitive. The analytics dashboard gives me real insight into how my students are performing.",
    rating: 5,
  },
];

const Landing = () => {
  const { session, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: publishedCourses } = usePublishedCourses();

  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scroll-smooth">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              CholoShikhi
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </a>
            <Link
              to="/about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About Us
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Testimonials
                </a>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  About Us
                </Link>
                <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link to="/auth">Log in</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-32 md:pt-36">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              Start learning today — it's free
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              Learn without limits,{" "}
              <span className="text-primary">grow without bounds</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              A modern learning platform with video lessons, interactive
              quizzes, and progress tracking — everything you need to master new
              skills.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/auth">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link to="/courses">Browse All Courses</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-20 max-w-4xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-2 text-xs text-muted-foreground">
                  choloshikhi.netlify.app
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3">
                {(publishedCourses && publishedCourses.length > 0
                  ? publishedCourses.slice(0, 3)
                  : [
                      {
                        id: "fallback-1",
                        image_url: "/images/course-cs.jpg",
                        title: "Computer Science 101",
                        category: "Technology",
                      },
                      {
                        id: "fallback-2",
                        image_url: "/images/course-photography.jpg",
                        title: "Photography Basics",
                        category: "Creative",
                      },
                      {
                        id: "fallback-3",
                        image_url: "/images/course-finance.jpg",
                        title: "Personal Finance",
                        category: "Business",
                      },
                    ]
                ).map((course, i) => {
                  const isReal =
                    publishedCourses && publishedCourses.length > 0;
                  const Wrapper = isReal ? Link : "div";
                  const wrapperProps = isReal
                    ? { to: `/course-preview/${course.id}` }
                    : {};
                  return (
                    // @ts-expect-error - Polymorphic wrapper types are difficult to reconcile conditionally
                    <Wrapper
                      key={course.id}
                      {...wrapperProps}
                      className="group overflow-hidden rounded-xl border border-border bg-background transition-all hover:shadow-md hover:border-primary/30"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={getOptimizedImageUrl(course.image_url, {
                            width: 480,
                          })}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          sizes={COURSE_CARD_SIZES}
                        />
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                          {course.category || "General"}
                        </span>
                        <p className="mt-1 text-xs font-semibold text-foreground">
                          {course.title}
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${30 + i * 25}%` }}
                          />
                        </div>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <p className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-medium uppercase tracking-widest text-primary"
            >
              Features
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            >
              Everything you need to learn & teach
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-muted-foreground"
            >
              From video streaming to auto-graded quizzes, CholoShikhi provides
              a complete toolkit for modern education.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <Card className="group h-full border-border/60 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-medium uppercase tracking-widest text-primary"
            >
              How it works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            >
              Three steps to start learning
            </motion.h2>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-10 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {[
              {
                step: "01",
                title: "Create an Account",
                description:
                  "Sign up in seconds with your email. Choose to learn or teach.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Browse & Enroll",
                description:
                  "Explore courses by category and enroll in the ones that interest you.",
                icon: BookOpen,
              },
              {
                step: "03",
                title: "Learn & Achieve",
                description:
                  "Watch lessons, complete quizzes, and track your progress to mastery.",
                icon: Award,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary/60">
                  Step {item.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-medium uppercase tracking-widest text-primary"
            >
              Testimonials
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            >
              Loved by learners & teachers
            </motion.h2>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/60">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      "{t.content}"
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center md:px-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary-foreground)/0.08),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to start your learning journey?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
                Join thousands of learners already growing their skills on
                CholoShikhi.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8 h-12 px-8 text-base"
                asChild
              >
                <Link to="/auth">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                CholoShikhi
              </span>
            </div>
            <div className="flex gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Testimonials
              </a>
              <Link
                to="/about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About Us
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CholoShikhi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
