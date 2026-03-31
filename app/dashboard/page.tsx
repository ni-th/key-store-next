"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoadingSession = status === "loading";

  const welcomeName = session?.user?.name || "User";
  const welcomeEmail = session?.user?.email || "No email available";

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Avatar size="lg">
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>
              Welcome {isLoadingSession ? <span className="ml-2 inline-block h-5 w-24 animate-pulse rounded bg-muted align-middle" /> : welcomeName}
            </CardTitle>
            <CardDescription>
              {isLoadingSession ? <span className="inline-block h-4 w-44 animate-pulse rounded bg-muted" /> : welcomeEmail}
            </CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 text-muted-foreground">
          You are signed in and can now access protected content.
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}