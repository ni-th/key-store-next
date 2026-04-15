// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import api from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type RegisterFormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: RegisterFormErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Full name is required.";
    }
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
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("Registration response:", response.data);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError("Registration successful but login failed. Please login manually.");
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed");
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

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Or{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              sign in to existing account
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldSet>
              <FieldGroup>
                <Field data-invalid={Boolean(formErrors.name)}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formErrors.name) {
                          setFormErrors((previous) => ({ ...previous, name: "" }));
                        }
                      }}
                      placeholder="John Doe"
                      aria-invalid={Boolean(formErrors.name)}
                    />
                    <FieldError>{formErrors.name}</FieldError>
                  </FieldContent>
                </Field>

                <Field data-invalid={Boolean(formErrors.email)}>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
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
                    />
                    <FieldError>{formErrors.email}</FieldError>
                  </FieldContent>
                </Field>

                <Field data-invalid={Boolean(formErrors.password)}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
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
                    />
                    <FieldError>{formErrors.password}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Sign up"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
            >
              <FcGoogle className="size-4 shrink-0" aria-hidden="true" />
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}