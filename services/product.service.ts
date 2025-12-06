import type {
  Product,
  ProductListItem,
  ProductListResponse,
  CategoryMetadata,
  ProductSortBy,
  ProductQueryParams,
} from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ProductsService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get products with filters and pagination
  async getProducts(
    params: ProductQueryParams = {}
  ): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();

    if (params.category) searchParams.set("category", params.category);
    if (params.isFeatured !== undefined)
      searchParams.set("isFeatured", String(params.isFeatured));
    if (params.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive));
    if (params.search) searchParams.set("search", params.search);
    if (params.minPrice !== undefined)
      searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      searchParams.set("maxPrice", String(params.maxPrice));
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);

    const query = searchParams.toString();
    return this.fetch<ProductListResponse>(
      `/products${query ? `?${query}` : ""}`
    );
  }

  // Get products by category
  async getProductsByCategory(
    category: string,
    sortBy: ProductSortBy = "featured",
    limit: number = 50
  ): Promise<ProductListItem[]> {
    return this.fetch<ProductListItem[]>(
      `/products/category/${category}?sortBy=${sortBy}&limit=${limit}`
    );
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<ProductListItem[]> {
    return this.fetch<ProductListItem[]>(`/products/featured?limit=${limit}`);
  }

  // Get single product (basic)
  async getProduct(idOrSlug: string): Promise<ProductListItem> {
    return this.fetch<ProductListItem>(`/products/${idOrSlug}`);
  }

  // Get single product (full detail)
  async getProductDetail(idOrSlug: string): Promise<Product> {
    return this.fetch<Product>(`/products/${idOrSlug}/detail`);
  }

  // Get category metadata
  async getCategoryMetadata(categorySlug: string): Promise<CategoryMetadata> {
    return this.fetch<CategoryMetadata>(`/products/categories/${categorySlug}`);
  }

  // Get all categories
  async getAllCategories(): Promise<CategoryMetadata[]> {
    return this.fetch<CategoryMetadata[]>(`/products/categories`);
  }

  // Add review
  async addReview(
    productId: string,
    data: {
      author: string;
      email?: string;
      rating: number;
      title: string;
      content: string;
    }
  ): Promise<Product> {
    return this.fetch<Product>(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Mark review helpful
  async markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
    return this.fetch<{ helpful: number }>(
      `/products/reviews/${reviewId}/helpful`,
      {
        method: "POST",
      }
    );
  }

  // Admin: Create product
  async createProduct(data: any): Promise<Product> {
    return this.fetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Admin: Update product
  async updateProduct(id: string, data: any): Promise<Product> {
    return this.fetch<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Admin: Delete product
  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
  }
}

export const productsService = new ProductsService();
