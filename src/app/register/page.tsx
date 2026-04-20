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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      inviteCode: formData.get("inviteCode") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Errore durante la registrazione");
      setLoading(false);
      return;
    }

    // Auto-login after registration
    const signInRes = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInRes?.error) {
      setError("Registrazione riuscita, ma errore nel login automatico");
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
            Crea il tuo account
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Inserisci il codice invito ricevuto dal manager
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Codice Invito</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="es. AB3F7K9X"
                required
                className="rounded-xl border-border bg-background font-mono uppercase transition-colors focus:border-[var(--ps-accent)] focus:ring-[var(--ps-accent)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Mario Rossi"
                required
                className="rounded-xl border-border bg-background transition-colors focus:border-[var(--ps-accent)] focus:ring-[var(--ps-accent)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email SUPSI</Label>
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
                minLength={6}
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
              {loading ? "Registrazione..." : "Registrati"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: "var(--ps-accent)" }}
            >
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
