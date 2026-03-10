import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap, Target, Eye, ArrowLeft, Heart, Lightbulb, Users, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const values = [
  {
    icon: Heart,
    title: "Passion for Learning",
    description: "We believe education should ignite curiosity and inspire lifelong learning in every student.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge technology to create engaging, interactive learning experiences.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster a supportive community where teachers and students grow together.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "We strive to make quality education accessible to everyone, everywhere.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">CholoShikhi</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          >
            About <span className="text-primary">CholoShikhi</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Empowering learners and educators through a modern, interactive platform built for the future of education.
          </motion.p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Vision */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-10"
            >
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-4 text-2xl font-bold md:text-3xl">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become the leading educational platform that transforms how people learn and teach across the world.
                  We envision a future where quality education knows no boundaries — where every learner has access to
                  world-class courses, engaging content, and a supportive community that nurtures growth.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We see CholoShikhi as more than a platform — it's a movement towards democratizing knowledge and
                  creating equal opportunities for everyone to unlock their full potential.
                </p>
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-10"
            >
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-4 text-2xl font-bold md:text-3xl">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide an intuitive, feature-rich learning management system that empowers educators to create
                  impactful courses and enables students to learn at their own pace with structured, high-quality content.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We are committed to building tools that make teaching effortless and learning enjoyable — from
                  video lessons and interactive quizzes to progress tracking and community engagement. Every feature
                  we build serves one purpose: helping people grow through knowledge.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/50 bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">Our Core Values</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              The principles that guide everything we do at CholoShikhi.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="rounded-xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl font-bold md:text-4xl"
          >
            Ready to start your learning journey?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="mx-auto mt-4 max-w-xl text-muted-foreground"
          >
            Join thousands of learners and educators on CholoShikhi today.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            className="mt-8"
          >
            <Button size="lg" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CholoShikhi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
