"use client";

import { FormEvent, useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import type {
  Category,
  CategoryFormPayload,
  PaginationMeta,
} from "@/types/types";
import type { CommonAlertVariant } from "@/components/ui/common-alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { CommonAlertDialog } from "@/components/ui/common-alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [editForm, setEditForm] = useState<FormState>(initialFormState);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
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
  const [editSubmitLoading, setEditSubmitLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState<boolean>(false);
  const [feedbackVariant, setFeedbackVariant] = useState<CommonAlertVariant>("success");
  const [feedbackTitle, setFeedbackTitle] = useState<string>("Success");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const columns: DataTableColumn<Category>[] = [
    {
      key: "id",
      header: "ID",
      render: (category) => category.id,
    },
    {
      key: "name",
      header: "Name",
      cellClassName: "px-3 py-2 whitespace-normal break-words",
      render: (category) => category.name,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "px-3 py-2 text-muted-foreground whitespace-normal break-words",
      render: (category) => category.description,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "px-3 py-2 text-right font-medium",
      cellClassName: "px-3 py-2 align-top",
      render: (category) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => handleEditOpen(category)}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteOpen(category)}
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

  const showFeedback = (
    variant: CommonAlertVariant,
    title: string,
    message: string
  ) => {
    setFeedbackVariant(variant);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackDialogOpen(true);
  };

  const loadCategories = async (targetPage: number) => {
    setListLoading(true);

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
      showFeedback("warning", "Request Failed", getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);

    const payload: CategoryFormPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    try {
      await categoryService.createCategory(payload);
      showFeedback("success", "Success", "Category created successfully.");

      resetForm();
      await loadCategories(page);
    } catch (error) {
      showFeedback("warning", "Request Failed", getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditOpen = (category: Category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      description: category.description,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCategory) {
      return;
    }

    setEditSubmitLoading(true);

    const payload: CategoryFormPayload = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
    };

    try {
      await categoryService.updateCategory(selectedCategory.id, payload);
      setEditDialogOpen(false);
      setSelectedCategory(null);
      showFeedback("success", "Success", "Category updated successfully.");
      await loadCategories(page);
    } catch (error) {
      showFeedback("warning", "Request Failed", getErrorMessage(error));
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const handleDeleteOpen = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) {
      return;
    }

    setDeletingId(selectedCategory.id);

    try {
      await categoryService.deleteCategory(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      showFeedback("success", "Success", "Category deleted successfully.");
      await loadCategories(page);
    } catch (error) {
      showFeedback("warning", "Request Failed", getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
          <CardDescription>Create a new category for organizing products.</CardDescription>
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
                {submitLoading ? "Saving..." : "Create Category"}
              </Button>
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
              <option value="DESC">Desc</option>
              <option value="createdAt:asc">Asc</option>
            </select>
          </div>

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

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditForm(initialFormState);
            setSelectedCategory(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details and save your changes.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((previous) => ({ ...previous, name: event.target.value }))
                }
                maxLength={120}
                placeholder="Category name"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((previous) => ({ ...previous, description: event.target.value }))
                }
                placeholder="Category description"
                className="min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={editSubmitLoading}>
                {editSubmitLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CommonAlertDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        variant={feedbackVariant}
        title={feedbackTitle}
        description={feedbackMessage}
        hideCancel
        confirmText="Okay"
        onConfirm={() => setFeedbackDialogOpen(false)}
      />

      <CommonAlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
          }
        }}
        variant="delete"
        title="Delete Category"
        description={
          selectedCategory
            ? `Are you sure you want to delete "${selectedCategory.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this category? This action cannot be undone."
        }
        onConfirm={handleDeleteConfirm}
        confirmLoading={deletingId === selectedCategory?.id}
      />
    </div>
  );
}
