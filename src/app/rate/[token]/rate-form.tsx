"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRating } from "@/components/ratings/star-rating";
import { toast } from "sonner";

interface RateFormProps {
  token: string;
  tutorName: string;
  subjectName: string;
}

export function RateForm({ token, tutorName, subjectName }: RateFormProps) {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (score < 1 || score > 5) {
      setError("Seleziona un punteggio da 1 a 5.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          score,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Errore nell'invio della valutazione");
        return;
      }

      toast.success("Grazie per la tua valutazione!");
      router.refresh();
    } catch {
      toast.error("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuta la tua esperienza</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Come valuteresti la lezione di <strong>{subjectName}</strong> con il tutor{" "}
              <strong>{tutorName}</strong>?
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Punteggio</label>
            <StarRating value={score} onChange={setScore} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Commento (opzionale)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Scrivi un commento sulla tua esperienza..."
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading || score === 0} className="w-full">
            {loading ? "Invio in corso..." : "Invia valutazione"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
