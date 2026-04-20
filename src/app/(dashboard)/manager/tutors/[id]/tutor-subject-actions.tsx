"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface SubjectOption {
  id: string;
  name: string;
}

export function AddTutorSubjectForm({
  tutorId,
  availableSubjects,
}: {
  tutorId: string;
  availableSubjects: SubjectOption[];
}) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!subjectId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tutors/${tutorId}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore durante l'aggiunta della materia");
        return;
      }

      toast.success("Materia aggiunta con successo!");
      setSubjectId("");
      router.refresh();
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (availableSubjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tutte le materie sono gia assegnate a questo tutor.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label>Aggiungi materia</Label>
          <Select value={subjectId} onValueChange={(v) => v && setSubjectId(v)}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Seleziona materia" />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd} disabled={loading || !subjectId}>
          {loading ? "Aggiunta..." : "Aggiungi"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function RemoveTutorSubjectButton({
  tutorId,
  subjectId,
  subjectName,
}: {
  tutorId: string;
  subjectId: string;
  subjectName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tutors/${tutorId}/subjects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Errore durante la rimozione");
        return;
      }

      toast.success("Materia rimossa con successo!");
      router.refresh();
    } catch {
      toast.error("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm" disabled={loading}>
            {loading ? "Rimozione..." : "Rimuovi"}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma rimozione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler rimuovere la materia &quot;{subjectName}&quot; da
            questo tutor?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleRemove}
          >
            Rimuovi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
