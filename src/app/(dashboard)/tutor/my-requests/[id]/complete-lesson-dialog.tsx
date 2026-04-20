"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function CompleteLessonDialog({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [durationMin, setDurationMin] = useState("45");
  const [location, setLocation] = useState("Campus Est SUPSI");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const duration = Number(durationMin);
    if (!date || !duration || duration < 1 || duration > 60) {
      toast.error("Inserisci una data valida e una durata tra 1 e 60 minuti.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          durationMin: duration,
          location: location || "Campus Est SUPSI",
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Errore nel completamento della lezione");
        return;
      }

      toast.success("Lezione completata!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        Completa lezione
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completa lezione</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data della lezione</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Durata (minuti, max 60)
            </label>
            <Input
              type="number"
              min={1}
              max={60}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Luogo</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Campus Est SUPSI"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (opzionale)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Argomenti trattati, commenti..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvataggio..." : "Conferma completamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
