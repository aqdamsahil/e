import { Poster, Category, AdminStats } from '../types';

export const API_BASE = '/api';

export async function fetchPosters(params?: {
  category?: string;
  search?: string;
  sort?: string;
  status?: 'published' | 'draft' | 'all';
  token?: string | null;
}): Promise<Poster[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.sort) query.append('sort', params.sort);
  if (params?.status) query.append('status', params.status);

  const headers: HeadersInit = {};
  if (params?.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }

  const res = await fetch(`${API_BASE}/posters?${query.toString()}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to load posters');
  }
  const data = await res.json();
  return data.posters;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await res.json();
  return data.categories;
}

export async function uploadPosters(formData: FormData, token: string): Promise<{ success: boolean; posters: Poster[]; message: string }> {
  const res = await fetch(`${API_BASE}/posters/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload posters');
  }
  return data;
}

export async function updatePoster(id: string, updates: Partial<Poster>, token: string): Promise<Poster> {
  const res = await fetch(`${API_BASE}/posters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update poster');
  }
  return data.poster;
}

export async function deletePoster(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/posters/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete poster');
  }
}

export async function trackDownload(id: string): Promise<number> {
  const res = await fetch(`${API_BASE}/posters/${id}/download`, {
    method: 'POST',
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.downloadCount;
}

export async function createCategory(name: string, description: string, token: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create category');
  }
  return data.category;
}

export async function deleteCategory(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete category');
  }
}

export async function fetchStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard statistics');
  }
  return data;
}

export async function loginAdmin(username: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}

export async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function logoutAdmin(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
}
