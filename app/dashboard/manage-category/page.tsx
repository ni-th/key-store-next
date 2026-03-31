import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageCategoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Category</CardTitle>
        <CardDescription>Create, update, and organize product categories.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Category management page is ready. You can add category forms and table listing here.
      </CardContent>
    </Card>
  );
}
