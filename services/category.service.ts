import { apiClient } from "@/lib/api-client";
import type {
  Category,
  CategoryFormPayload,
  PaginatedResponse,
  PaginationQueryParams,
} from "@/types/types";

class CategoryService {
  async getCategories(params: PaginationQueryParams = {}): Promise<PaginatedResponse<Category>> {
    const query = new URLSearchParams();

    if (typeof params.page === "number") {
      query.set("page", String(params.page));
    }

    if (typeof params.limit === "number") {
      query.set("limit", String(params.limit));
    }

    if (typeof params.sort === "string" && params.sort.trim()) {
      query.set("sort", params.sort.trim());
    }

    if (typeof params.search === "string" && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    const endpoint = query.toString()
      ? `/category/get-categories?${query.toString()}`
      : "/category/get-categories";

    return apiClient.get<PaginatedResponse<Category>>(endpoint);
  }

  async createCategory(payload: CategoryFormPayload): Promise<Category> {
    return apiClient.post<Category>("/category/create-category", payload);
  }

  async updateCategory(id: number, payload: CategoryFormPayload): Promise<Category> {
    return apiClient.put<Category>(`/category/update-category/${id}`, payload);
  }

  async deleteCategory(id: number): Promise<void> {
    return apiClient.delete<void>(`/category/delete-category/${id}`);
  }
}

export const categoryService = new CategoryService();
