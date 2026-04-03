import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { authOptions } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const welcomeName = session.user.name || "User";
  const welcomeEmail = session.user.email || "No email available";

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Avatar size="lg">
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Welcome {welcomeName}</CardTitle>
            <CardDescription>{welcomeEmail}</CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 text-muted-foreground">
          You are signed in and can now access protected content.
        </CardContent>
        <CardFooter>
          <LogoutButton />
        </CardFooter>
      </Card>
    </div>
  );
}