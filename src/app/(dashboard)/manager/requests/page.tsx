import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/lib/button-variants";
import { StatusBadge } from "@/components/shared/status-badge";
import { RequestStatusFilter } from "./request-status-filter";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const where =
    status && status !== "ALL" ? { status } : {};

  const requests = await prisma.tutoringRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      subject: { select: { name: true } },
      claimedBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestione Richieste</h2>
        <Link href="/manager/requests/new" className={buttonVariants()}>
          Nuova Richiesta
        </Link>
      </div>

      <RequestStatusFilter />

      <Card>
        <CardHeader>
          <CardTitle>Richieste ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessuna richiesta trovata.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N.</TableHead>
                  <TableHead>Studente</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data preferita</TableHead>
                  <TableHead>Presa da</TableHead>
                  <TableHead>Creata il</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono font-medium">
                      #{request.requestNumber}
                    </TableCell>
                    <TableCell>{request.studentName}</TableCell>
                    <TableCell>{request.subject.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {request.preferredDate
                        ? new Date(request.preferredDate).toLocaleDateString(
                            "it-IT",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {request.claimedBy ? (
                        request.claimedBy.name
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/manager/requests/${request.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Dettaglio
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
