//enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

//interfaces
export interface User {
  id: number;
  name?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  total: number;
  limit: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface CategoryFormPayload {
  name: string;
  description: string;
}