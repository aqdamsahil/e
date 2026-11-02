export interface Poster {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  storagePath?: string;
  fileFormat: string;
  fileSize: number;
  published: boolean;
  downloadCount: number;
  uploaderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  posterCount?: number;
  createdAt?: string;
}

export interface AdminStats {
  totalPosters: number;
  publishedPosters: number;
  draftPosters: number;
  totalDownloads: number;
  categoryCount: number;
  topDownloaded: Poster[];
}

export interface AdminUser {
  username: string;
  role: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
}
