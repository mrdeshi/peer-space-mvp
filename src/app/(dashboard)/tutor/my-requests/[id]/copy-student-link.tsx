"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyStudentLink({ chatToken }: { chatToken: string }) {
  function handleCopy() {
    const url = `${window.location.origin}/chat/${chatToken}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiato! Condividilo con lo studente."),
      () => toast.error("Errore nel copiare il link")
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copia link chat studente
    </Button>
  );
}
