import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageProductsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Products</CardTitle>
        <CardDescription>Add, edit, and track your products from one place.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Product management page is ready. You can add product forms and product table here.
      </CardContent>
    </Card>
  );
}
