"use client";

import { FormEvent, useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import type {
  Category,
  CategoryFormPayload,
  PaginationMeta,
} from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

type FormState = {
  name: string;
  description: string;
};

const initialFormState: FormState = {
  name: "",
  description: "",
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const maybeAxios = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
      message?: string;
    };

    const backendMessage = maybeAxios.response?.data?.message;
    if (Array.isArray(backendMessage)) {
      return backendMessage.join(", ");
    }
    if (typeof backendMessage === "string") {
      return backendMessage;
    }

    if (typeof maybeAxios.message === "string") {
      return maybeAxios.message;
    }
  }

  return "Something went wrong. Please try again.";
}

export default function ManageCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(DEFAULT_PAGE);
  const [limit] = useState<number>(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("ASC");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
    nextPage: null,
    previousPage: null,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [listLoading, setListLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const columns: DataTableColumn<Category>[] = [
    {
      key: "id",
      header: "ID",
      render: (category) => category.id,
    },
    {
      key: "name",
      header: "Name",
      render: (category) => category.name,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "px-3 py-2 text-muted-foreground",
      render: (category) => category.description,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "px-3 py-2 text-right font-medium",
      cellClassName: "px-3 py-2",
      render: (category) => (
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(category)}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(category.id)}
            disabled={deletingId === category.id}
          >
            {deletingId === category.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setPage(DEFAULT_PAGE);
  }, [search, sort]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    void loadCategories(page);
  }, [page, sort, search]);

  const loadCategories = async (targetPage: number) => {
    setListLoading(true);
    setErrorMessage("");

    try {
      const response = await categoryService.getCategories({
        page: targetPage,
        limit,
        sort,
        search,
      });

      setCategories(response.data);
      setPagination(response.pagination);
      setPage(response.pagination.page);

      if (response.data.length === 0 && response.pagination.page > 1) {
        const previousPage = response.pagination.page - 1;
        setPage(previousPage);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload: CategoryFormPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    try {
      if (editingId !== null) {
        await categoryService.updateCategory(editingId, payload);
        setSuccessMessage("Category updated successfully.");
      } else {
        await categoryService.createCategory(payload);
        setSuccessMessage("Category created successfully.");
      }

      resetForm();
      await loadCategories(page);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description,
    });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm("Delete this category?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await categoryService.deleteCategory(id);
      setSuccessMessage("Category deleted successfully.");
      await loadCategories(page);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{editingId !== null ? "Update Category" : "Create Category"}</CardTitle>
          <CardDescription>
            {editingId !== null
              ? "Edit the selected category and save your changes."
              : "Create a new category for organizing products."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                maxLength={120}
                placeholder="Category name"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, description: event.target.value }))
                }
                placeholder="Category description"
                className="min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? "Saving..." : editingId !== null ? "Update Category" : "Create Category"}
              </Button>

              {editingId !== null && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitLoading}>
                  Cancel Editing
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>
            Showing page {pagination.page} of {Math.max(pagination.totalPages, 1)} with {pagination.total} total categories.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search categories"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="DESC">Desc Created At</option>
              <option value="createdAt:asc">Asc Created At</option>
            </select>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-lg border border-emerald-600/20 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </div>
          ) : null}

          <DataTable
            columns={columns}
            data={categories}
            rowKey={(category) => category.id}
            isLoading={listLoading}
            loadingText="Loading categories..."
            emptyText="No categories found."
          />

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
              disabled={!pagination.hasPreviousPage || listLoading}
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Page {pagination.page} / {Math.max(pagination.totalPages, 1)}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((previous) => previous + 1)}
              disabled={!pagination.hasNextPage || listLoading}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
