import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <section className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Securely manage your keys</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Store, organize, and access your keys from one place with a clean and fast interface.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Fast Access</CardTitle>
              <CardDescription>Quickly find the key you need.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Search and filter your keys with minimal clicks.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure by Design</CardTitle>
              <CardDescription>Built with authenticated access.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Your account session is managed with secure authentication flows.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Clean UI</CardTitle>
              <CardDescription>Modern components powered by shadcn.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Consistent cards, buttons, and inputs for better usability.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}