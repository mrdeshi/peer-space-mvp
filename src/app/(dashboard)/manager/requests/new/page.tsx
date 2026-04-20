"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SubjectOption {
  id: string;
  name: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    degreeProgram: "",
    academicYear: "",
    subjectId: "",
    preferredDate: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch("/api/subjects");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch {
        // silently fail, subjects will be empty
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: Record<string, string | undefined> = {
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        degreeProgram: form.degreeProgram,
        academicYear: form.academicYear,
        subjectId: form.subjectId,
      };

      if (form.preferredDate) {
        body.preferredDate = new Date(form.preferredDate).toISOString();
      }

      if (form.notes.trim()) {
        body.notes = form.notes.trim();
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore durante la creazione della richiesta");
        return;
      }

      router.push("/manager/requests");
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    form.studentName.trim() &&
    form.studentEmail.trim() &&
    form.degreeProgram.trim() &&
    form.academicYear &&
    form.subjectId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/manager/requests" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Torna alla lista
        </Link>
        <h2 className="text-2xl font-bold">Nuova Richiesta di Tutorato</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dati della richiesta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentName">Nome studente *</Label>
                <Input
                  id="studentName"
                  placeholder="Mario Rossi"
                  value={form.studentName}
                  onChange={(e) => updateField("studentName", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentEmail">Email studente *</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  placeholder="mario.rossi@student.supsi.ch"
                  value={form.studentEmail}
                  onChange={(e) => updateField("studentEmail", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degreeProgram">Corso di laurea *</Label>
                <Input
                  id="degreeProgram"
                  placeholder="Informatica"
                  value={form.degreeProgram}
                  onChange={(e) => updateField("degreeProgram", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Anno accademico *</Label>
                <Select
                  value={form.academicYear}
                  onValueChange={(value) => value && updateField("academicYear", value)}
                  disabled={loading}
                >
                  <SelectTrigger id="academicYear">
                    <SelectValue placeholder="Seleziona anno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1° anno</SelectItem>
                    <SelectItem value="2">2° anno</SelectItem>
                    <SelectItem value="3">3° anno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectId">Materia *</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(value) => value && updateField("subjectId", value)}
                  disabled={loading || loadingSubjects}
                >
                  <SelectTrigger id="subjectId">
                    <SelectValue
                      placeholder={
                        loadingSubjects
                          ? "Caricamento materie..."
                          : "Seleziona materia"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDate">Data preferita</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) =>
                    updateField("preferredDate", e.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note aggiuntive</Label>
              <Textarea
                id="notes"
                placeholder="Informazioni aggiuntive sulla richiesta..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !isValid}>
                {loading ? "Creazione in corso..." : "Crea Richiesta"}
              </Button>
              <Link href="/manager/requests" className={buttonVariants({ variant: "outline" })}>
                Annulla
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
