export interface WebsiteFile {
  path: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  stack?: string;
  previewUrl?: string;
  files?: WebsiteFile[];
}

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  initials: string;
}
