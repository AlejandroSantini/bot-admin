export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image?: string | null;
  author: string;
  tags?: string[];
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormData {
  id?: string;
  title: string;
  slug?: string;
  content: string;
  cover_image?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}
