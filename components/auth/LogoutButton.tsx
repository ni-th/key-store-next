"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (apiBaseUrl) {
      try {
        await fetch(`${apiBaseUrl}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
    }

    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}
