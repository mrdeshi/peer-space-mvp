import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN":
      return <Badge variant="outline">Aperta</Badge>;
    case "CLAIMED":
      return <Badge variant="default">In carico</Badge>;
    case "COMPLETED":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          Completata
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Cancellata</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
