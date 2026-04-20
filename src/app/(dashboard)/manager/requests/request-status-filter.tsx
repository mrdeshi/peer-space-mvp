"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tutti gli stati" },
  { value: "OPEN", label: "Aperte" },
  { value: "CLAIMED", label: "Prese in carico" },
  { value: "COMPLETED", label: "Completate" },
  { value: "CANCELLED", label: "Cancellate" },
];

export function RequestStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "ALL";

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/manager/requests?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <Label>Filtra per stato:</Label>
      <Select value={currentStatus} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
