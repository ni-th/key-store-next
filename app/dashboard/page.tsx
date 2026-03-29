"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    router.push("/login");
  };

  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}