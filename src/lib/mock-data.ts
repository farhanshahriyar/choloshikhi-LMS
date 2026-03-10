export interface Course {
  id: string;
  title: string;
  category: string;
  image: string;
  chapters: Chapter[];
  price: number | null; // null = free
  progress: number; // 0-100
  enrolled: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  isLocked: boolean;
  isFree: boolean;
  videoUrl?: string;
  description: string;
}

export const categories = [
  { name: "Accounting", emoji: "📊" },
  { name: "Computer Science", emoji: "💻" },
  { name: "Engineering", emoji: "⚙️" },
  { name: "Filming", emoji: "🎬" },
  { name: "Fitness", emoji: "💪" },
  { name: "Music", emoji: "🎵" },
  { name: "Photography", emoji: "📷" },
];

export const courses: Course[] = [
  {
    id: "1",
    title: "Cinematic Techniques",
    category: "Filming",
    image: "/images/course-filming.jpg",
    price: null,
    progress: 100,
    enrolled: true,
    chapters: [
      { id: "1-1", title: "Introduction", isLocked: false, isFree: true, description: "In this chapter, we will cover various aspects related to Introduction. By the end, you will have a strong understanding of the key concepts and practical applications." },
      { id: "1-2", title: "Camera Angles", isLocked: false, isFree: false, description: "Learn about different camera angles and their impact on storytelling." },
      { id: "1-3", title: "Lighting Setup", isLocked: false, isFree: false, description: "Master the fundamentals of lighting for cinematic productions." },
      { id: "1-4", title: "Post Production", isLocked: false, isFree: false, description: "Explore post-production techniques and color grading." },
    ],
  },
  {
    id: "2",
    title: "Introduction to Filming",
    category: "Filming",
    image: "/images/course-filming.jpg",
    price: null,
    progress: 50,
    enrolled: true,
    chapters: [
      { id: "2-1", title: "Introduction", isLocked: false, isFree: true, description: "Get started with the basics of filming." },
      { id: "2-2", title: "Equipment Basics", isLocked: false, isFree: false, description: "Learn about essential filming equipment." },
    ],
  },
  {
    id: "3",
    title: "Structural Design Principles",
    category: "Engineering",
    image: "/images/course-engineering.jpg",
    price: null,
    progress: 30,
    enrolled: true,
    chapters: [
      { id: "3-1", title: "Introduction", isLocked: false, isFree: true, description: "Overview of structural design." },
      { id: "3-2", title: "Load Analysis", isLocked: false, isFree: false, description: "Understanding load distribution." },
      { id: "3-3", title: "Material Selection", isLocked: false, isFree: false, description: "Choosing the right materials." },
      { id: "3-4", title: "Safety Factors", isLocked: false, isFree: false, description: "Implementing safety margins." },
      { id: "3-5", title: "Case Studies", isLocked: false, isFree: false, description: "Real-world structural design examples." },
      { id: "3-6", title: "Foundation Design", isLocked: false, isFree: false, description: "Foundation types and calculations." },
      { id: "3-7", title: "Steel Structures", isLocked: false, isFree: false, description: "Design of steel structures." },
      { id: "3-8", title: "Concrete Design", isLocked: false, isFree: false, description: "Reinforced concrete design." },
      { id: "3-9", title: "Seismic Design", isLocked: false, isFree: false, description: "Earthquake resistant design." },
      { id: "3-10", title: "Final Review", isLocked: false, isFree: false, description: "Comprehensive review." },
    ],
  },
  {
    id: "4",
    title: "Engineering Basics",
    category: "Engineering",
    image: "/images/course-engineering.jpg",
    price: null,
    progress: 17,
    enrolled: true,
    chapters: [
      { id: "4-1", title: "Introduction", isLocked: false, isFree: true, description: "Intro to engineering fundamentals." },
      { id: "4-2", title: "Physics Review", isLocked: false, isFree: false, description: "Review of essential physics." },
      { id: "4-3", title: "Mathematics", isLocked: false, isFree: false, description: "Core math concepts." },
      { id: "4-4", title: "Problem Solving", isLocked: false, isFree: false, description: "Engineering problem-solving methods." },
      { id: "4-5", title: "Technical Drawing", isLocked: false, isFree: false, description: "Basics of technical drawing." },
      { id: "4-6", title: "Lab Basics", isLocked: false, isFree: false, description: "Introduction to lab work." },
    ],
  },
  {
    id: "5",
    title: "Tax Accounting Basics",
    category: "Accounting",
    image: "/images/course-accounting.jpg",
    price: null,
    progress: 100,
    enrolled: true,
    chapters: Array.from({ length: 10 }, (_, i) => ({
      id: `5-${i + 1}`,
      title: `Chapter ${i + 1}`,
      isLocked: false,
      isFree: i === 0,
      description: `Tax accounting chapter ${i + 1} content.`,
    })),
  },
  {
    id: "6",
    title: "Financial Reporting",
    category: "Accounting",
    image: "/images/course-finance.jpg",
    price: 92,
    progress: 0,
    enrolled: false,
    chapters: Array.from({ length: 6 }, (_, i) => ({
      id: `6-${i + 1}`,
      title: i === 0 ? "Introduction" : `Chapter ${i + 1}`,
      isLocked: i > 0,
      isFree: i === 0,
      description: `Financial reporting chapter ${i + 1} content.`,
    })),
  },
  {
    id: "7",
    title: "Nature Photography Basics",
    category: "Photography",
    image: "/images/course-photography.jpg",
    price: 53,
    progress: 0,
    enrolled: false,
    chapters: Array.from({ length: 8 }, (_, i) => ({
      id: `7-${i + 1}`,
      title: i === 0 ? "Introduction" : `Chapter ${i + 1}`,
      isLocked: i > 0,
      isFree: i === 0,
      description: `Photography chapter ${i + 1} content.`,
    })),
  },
  {
    id: "8",
    title: "Capturing the Moment",
    category: "Photography",
    image: "/images/course-photography.jpg",
    price: 96,
    progress: 0,
    enrolled: false,
    chapters: Array.from({ length: 8 }, (_, i) => ({
      id: `8-${i + 1}`,
      title: i === 0 ? "Introduction" : `Chapter ${i + 1}`,
      isLocked: i > 0,
      isFree: i === 0,
      description: `Photography chapter ${i + 1} content.`,
    })),
  },
  {
    id: "9",
    title: "Rhythms and Melodies",
    category: "Music",
    image: "/images/course-music.jpg",
    price: null,
    progress: 100,
    enrolled: true,
    chapters: Array.from({ length: 3 }, (_, i) => ({
      id: `9-${i + 1}`,
      title: i === 0 ? "Introduction" : `Chapter ${i + 1}`,
      isLocked: false,
      isFree: i === 0,
      description: `Music chapter ${i + 1} content.`,
    })),
  },
  {
    id: "10",
    title: "Yoga for Beginners",
    category: "Fitness",
    image: "/images/course-yoga.jpg",
    price: 15,
    progress: 0,
    enrolled: false,
    chapters: [
      { id: "10-1", title: "Introduction", isLocked: false, isFree: true, description: "In this chapter, we will cover various aspects related to Introduction. By the end, you will have a strong understanding of the key concepts and practical applications." },
      { id: "10-2", title: "Deep Dive", isLocked: true, isFree: false, description: "In this chapter, we will cover various aspects related to Deep Dive. By the end, you will have a strong understanding of the key concepts and practical applications." },
      { id: "10-3", title: "Exploring the Basics", isLocked: true, isFree: false, description: "Learn the fundamental yoga poses." },
      { id: "10-4", title: "Exploring the Basics", isLocked: true, isFree: false, description: "Continue exploring fundamental poses." },
      { id: "10-5", title: "Outro", isLocked: true, isFree: false, description: "Wrapping up the course." },
    ],
  },
  {
    id: "11",
    title: "Web Development 101",
    category: "Computer Science",
    image: "/images/course-cs.jpg",
    price: 79,
    progress: 0,
    enrolled: false,
    chapters: Array.from({ length: 8 }, (_, i) => ({
      id: `11-${i + 1}`,
      title: i === 0 ? "Introduction" : `Chapter ${i + 1}`,
      isLocked: i > 0,
      isFree: i === 0,
      description: `CS chapter ${i + 1} content.`,
    })),
  },
];
