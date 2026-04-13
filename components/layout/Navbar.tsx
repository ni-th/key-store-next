"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, ShoppingCart, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isDark = resolvedTheme === "dark";
  const isSessionLoading = status === "loading";
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";
  const userImage = session?.user?.image || session?.user?.avatar;

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Key Store
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {mounted && isDark ? <Sun /> : <Moon />}
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart />
            </Link>
          </Button>

          {isSessionLoading ? (
            <div
              className="h-9 w-9 animate-pulse rounded-full bg-muted"
              aria-label="Loading user session"
            />
          ) : session?.user ? (
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open user menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <Avatar size="sm">
                  {userImage ? (
                    <AvatarImage
                      src={userImage}
                      alt={session?.user?.name || "User profile picture"}
                    />
                  ) : null}
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-40 rounded-md border bg-background p-1 shadow-md"
                >
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="block rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

