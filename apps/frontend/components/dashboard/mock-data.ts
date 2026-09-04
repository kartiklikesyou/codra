export interface Project {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  stack?: string;
  previewUrl  ?: string
}

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  initials: string;
}

export const CURRENT_USER: UserProfile = {
  name: "Kartik",
  email: "kartik@codra.ai",
  username: "kartiklikesyou",
  initials: "K",
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "My Portfolio",
    description: "Personal developer portfolio website",
    updatedAt: "Edited 2 hours ago",
    stack: "Next.js",
  },
  {
    id: "proj-2",
    name: "SaaS Dashboard",
    description: "Analytics dashboard for a SaaS product",
    updatedAt: "Edited yesterday",
    stack: "Next.js • Tailwind",
  },
  {
    id: "proj-3",
    name: "E-commerce Store",
    description: "Modern online clothing store",
    updatedAt: "Edited 3 days ago",
    stack: "Next.js • Stripe",
  },
  {
    id: "proj-4",
    name: "Collaboration Canvas",
    description: "Infinite vector canvas with real-time sync",
    updatedAt: "Edited 5 days ago",
    stack: "React • Canvas",
  },
  {
    id: "proj-5",
    name: "Backend API",
    description: "REST API with Prisma ORM",
    updatedAt: "Edited 1 week ago",
    stack: "Express • Prisma",
  },
];
