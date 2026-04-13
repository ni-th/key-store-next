"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LoginFormErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: LoginFormErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    }
    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        // Successful login - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBaseUrl) {
      setError("API URL is not configured.");
      setGoogleLoading(false);
      return;
    }

    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // If there is no active backend session, continue with OAuth flow.
    }

    const popup = window.open(
      `${apiBaseUrl}/api/auth/google?prompt=select_account`,
      "google-login",
      "width=520,height=720"
    );

    if (!popup) {
      setError("Popup blocked. Please allow popups and try again.");
      setGoogleLoading(false);
      return;
    }

    try {
      const isAuthenticated = await new Promise<boolean>((resolve) => {
        const maxAttempts = 60;
        let attempts = 0;

        const interval = window.setInterval(async () => {
          attempts += 1;

          if (popup.closed) {
            window.clearInterval(interval);
            resolve(false);
            return;
          }

          try {
            const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
              method: "GET",
              credentials: "include",
            });

            if (response.ok) {
              window.clearInterval(interval);
              popup.close();
              resolve(true);
              return;
            }
          } catch {
            // Keep polling until timeout or success.
          }

          if (attempts >= maxAttempts) {
            window.clearInterval(interval);
            popup.close();
            resolve(false);
          }
        }, 1000);
      });

      if (!isAuthenticated) {
        setError("Google login was not completed. Please try again.");
        return;
      }

      const result = await signIn("google-session", { redirect: false });

      if (result?.error || !result?.ok) {
        setError("Google login failed. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Google login error:", error);
      setError("An error occurred during Google login.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center px-4">
        <Card className="w-full">
          <CardContent className="pt-4 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Or{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              create a new account
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldSet>
              <FieldGroup>
                <Field data-invalid={Boolean(formErrors.email)}>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) {
                          setFormErrors((previous) => ({ ...previous, email: "" }));
                        }
                      }}
                      placeholder="you@example.com"
                      aria-invalid={Boolean(formErrors.email)}
                      suppressHydrationWarning
                    />
                    <FieldError>{formErrors.email}</FieldError>
                  </FieldContent>
                </Field>

                <Field data-invalid={Boolean(formErrors.password)}>
                  <FieldLabel htmlFor="password">Password *</FieldLabel>
                  <FieldContent>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) {
                          setFormErrors((previous) => ({ ...previous, password: "" }));
                        }
                      }}
                      placeholder="••••••••"
                      aria-invalid={Boolean(formErrors.password)}
                      suppressHydrationWarning
                    />
                    <FieldError>{formErrors.password}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
            >
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


