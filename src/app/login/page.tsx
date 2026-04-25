"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PeerSpaceLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const DEMO_ACCOUNTS = [
  { label: "Manager", email: "manager@supsi.ch", password: "manager123" },
  { label: "Tutor", email: "tutor@student.supsi.ch", password: "tutor123" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function handleDemoLogin(email: string, password: string, label: string) {
    setDemoLoading(label);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Account demo non trovato. Esegui il seed del database.");
      setDemoLoading(null);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (res?.error) {
      setError("Email o password non validi");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo & branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <PeerSpaceLogo size="lg" />
          <p className="text-sm text-muted-foreground">
            Connetti, impara, migliora
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-border bg-card p-8">
          <h2
            className="mb-1 text-lg font-bold"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Bentornato
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Accedi al tuo account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@student.supsi.ch"
                required
                className="rounded-xl border-border bg-background transition-colors focus:border-[var(--ps-accent)] focus:ring-[var(--ps-accent)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="rounded-xl border-border bg-background transition-colors focus:border-[var(--ps-accent)] focus:ring-[var(--ps-accent)]"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full rounded-xl text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--ps-accent), var(--ps-accent-dark))",
                boxShadow: "0 4px 20px var(--ps-accent-glow)",
              }}
              disabled={loading}
            >
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Hai un codice invito?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors"
              style={{ color: "var(--ps-accent)" }}
            >
              Registrati
            </Link>
          </div>

          {/* Demo quick-login */}
          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Accesso rapido demo
            </p>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.label}
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  disabled={demoLoading !== null || loading}
                  onClick={() => handleDemoLogin(account.email, account.password, account.label)}
                >
                  {demoLoading === account.label ? "Accesso..." : account.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
