export interface CategoryRef {
  id: number;
  name: string;
}

export interface ProductVariant {
  id?: number;
  name: string;
  quantity: number;
  price_wholesale_usd: number;
  price_retail_usd: number;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
}

export interface RelatedProduct {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  description_es?: string;
  description_pt?: string;
  description_en?: string;
  stock: number;
  iva: number;
  featured: boolean;
  status: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  categories: CategoryRef[];
  subcategories: CategoryRef[];
  variants?: ProductVariant[];
  related_products?: RelatedProduct[];
  relatedProducts?: number[];
  price_usd?: number;
}

export interface ProductFormData {
  id?: number;
  sku: string;
  name: string;
  description_es: string;
  description_pt: string;
  description_en: string;
  stock: number;
  iva: number;
  featured: boolean;
  video_url?: string;
  categoryId: number;
  subcategoryId: number;
  variants: ProductVariant[];
  relatedProducts?: number[];
}
