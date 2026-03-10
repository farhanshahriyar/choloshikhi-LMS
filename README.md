# CholoShikhi — চলো শিখি 📚

A modern Learning Management System (LMS) built with React, Supabase, and TypeScript. CholoShikhi (Bengali for "Let's Learn") enables teachers to create and manage courses while students can browse, enroll, and track their progress.

🌐 **Live Demo:** [choloshikhi.netlify.app](https://choloshikhi.netlify.app)

---

## ✨ Features

### 🎓 Student

- Browse and search published courses by category
- Enroll in free or paid courses
- Watch video lessons (Mux-powered)
- Track chapter completion progress
- Take quizzes with instant auto-grading
- View enrolled courses on a personalized dashboard
- Manage profile and account settings

### 👩‍🏫 Teacher

- Create and manage courses with rich text descriptions
- Upload course images and attachments
- Organize chapters with drag-and-drop reordering
- Embed video content via Mux integration
- Create quizzes with multiple-choice questions
- Publish/unpublish courses and individual chapters
- View enrollment analytics and student progress
- Manage student enrollments (active / suspend / ban)
- Send email notifications to students

### 🔐 Platform

- Email/password authentication via Supabase Auth
- Role-based access control (student / teacher)
- Row-Level Security (RLS) on all database tables
- Dark / light theme toggle
- Fully responsive design (mobile, tablet, desktop)
- Smooth page transitions with Framer Motion

---

## 🛠 Tech Stack

| Layer            | Technology                                         |
| ---------------- | -------------------------------------------------- |
| **Framework**    | React 18 + TypeScript                              |
| **Build Tool**   | Vite                                               |
| **Styling**      | Tailwind CSS + shadcn/ui                           |
| **Animation**    | Framer Motion                                      |
| **State / Data** | TanStack React Query                               |
| **Forms**        | React Hook Form + Zod                              |
| **Backend**      | Supabase (Auth, Database, Storage, Edge Functions) |
| **Video**        | Mux                                                |
| **Routing**      | React Router v6                                    |
| **Charts**       | Recharts                                           |
| **Drag & Drop**  | dnd-kit                                            |

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   └── ui/            # shadcn/ui primitives
├── contexts/          # Auth, Theme, Mode providers
├── hooks/             # Custom hooks (courses, enrollments, chapters, quizzes…)
├── integrations/
│   └── supabase/      # Supabase client & generated types
├── layouts/           # MainLayout with sidebar
├── lib/               # Utilities & mock data
├── pages/             # Route-level page components
│   ├── Auth.tsx
│   ├── Browse.tsx
│   ├── CourseDetail.tsx
│   ├── Dashboard.tsx
│   ├── TeacherCourses.tsx
│   ├── TeacherCourseSetup.tsx
│   ├── TeacherChapterEdit.tsx
│   ├── TeacherQuizEdit.tsx
│   ├── TeacherAnalytics.tsx
│   ├── TeacherEnrollments.tsx
│   ├── Profile.tsx
│   └── Settings.tsx
└── index.css          # Design tokens & global styles

supabase/
├── functions/         # Edge Functions
│   ├── mux-video/     # Mux video upload & playback
│   ├── submit-quiz/   # Server-side quiz grading
│   └── send-notification/  # Email notifications
└── migrations/        # Database migrations
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- npm or [bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project

### Installation

```bash
# Clone the repository
git clone https://github.com/farhanshahriyar/choloshikhi-LMS-.git
cd choloshikhi-LMS-

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

> **Note**: In some generated code setups, `src/integrations/supabase/client.ts` may contain hardcoded credentials. If you wish to use the `.env` file instead, make sure to update `client.ts` to use `import.meta.env`.

---

## 🗄 Supabase Setup

### Initialization & Migrations

1. Link your Supabase project:
   ```bash
   npx supabase link --project-ref your-project-id
   ```
2. Push the database schema:
   ```bash
   npx supabase db push
   ```

### Database Tables

| Table                | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `profiles`           | User profile data (name, email, avatar, bio)                               |
| `user_roles`         | Role assignments (`student` / `teacher`)                                   |
| `courses`            | Course metadata (title, description, price, category, image)               |
| `chapters`           | Course chapters with ordering, video URLs, publish status                  |
| `course_attachments` | Downloadable files attached to courses                                     |
| `enrollments`        | Student-course enrollments with status (`active` / `suspended` / `banned`) |
| `chapter_progress`   | Per-user chapter completion tracking                                       |
| `quizzes`            | Quizzes linked to chapters                                                 |
| `quiz_questions`     | Multiple-choice questions with correct answer index                        |
| `quiz_attempts`      | Student quiz scores and history                                            |

### Edge Functions

| Function            | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `mux-video`         | Handles Mux video upload URLs and playback IDs |
| `submit-quiz`       | Server-side quiz answer validation and scoring |
| `send-notification` | Queues email notifications to students         |

#### Deploying Edge Functions

Deploy your functions using the Supabase CLI:

```bash
npx supabase functions deploy
```

#### Required Secrets

You must set the following secrets in your Supabase project for the functions to work (especially `mux-video`). You can set them via the Supabase Dashboard or CLI:

```bash
npx supabase secrets set MUX_TOKEN_ID="your-mux-token-id"
npx supabase secrets set MUX_TOKEN_SECRET="your-mux-token-secret"
npx supabase secrets set SUPABASE_URL="https://your-project-id.supabase.co"
npx supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Row-Level Security

All tables have RLS enabled with policies using the `has_role()` and `is_course_teacher()` security-definer functions to prevent privilege escalation.

---

## 📜 Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Production build         |
| `npm run preview`    | Preview production build |
| `npm run lint`       | Run ESLint               |
| `npm run test`       | Run tests (Vitest)       |
| `npm run test:watch` | Run tests in watch mode  |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
