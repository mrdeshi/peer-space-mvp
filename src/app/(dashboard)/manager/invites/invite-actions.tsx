"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CreateInviteForm() {
  const router = useRouter();
  const [role, setRole] = useState("TUTOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");
    setCreatedCode("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore durante la creazione dell'invito");
        return;
      }

      const data = await res.json();
      setCreatedCode(data.code);
      toast.success("Codice invito creato con successo!");
      router.refresh();
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea Nuovo Invito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <Label>Ruolo</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleziona ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TUTOR">Tutor</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creazione..." : "Genera Codice Invito"}
          </Button>
        </div>

        {createdCode && (
          <div className="mt-4 rounded-md border bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Codice invito creato:
            </p>
            <p className="mt-1 font-mono text-lg font-bold">{createdCode}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Condividi questo codice con il nuovo utente per la registrazione.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
