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
import { Badge } from "@/components/ui/badge";
import { CreateInviteForm } from "./invite-actions";

function getInviteStatus(invite: {
  usedAt: Date | null;
  expiresAt: Date;
}): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (invite.usedAt) {
    return { label: "Utilizzato", variant: "secondary" };
  }
  if (new Date(invite.expiresAt) < new Date()) {
    return { label: "Scaduto", variant: "destructive" };
  }
  return { label: "Attivo", variant: "default" };
}

export default async function InvitesPage() {
  const invites = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usedBy: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestione Inviti</h2>

      <CreateInviteForm />

      <Card>
        <CardHeader>
          <CardTitle>Codici Invito ({invites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessun invito creato. Genera il primo codice invito.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codice</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Creato il</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead>Utilizzato da</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const status = getInviteStatus(invite);
                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-mono text-sm">
                        {invite.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invite.role === "MANAGER" ? "Manager" : "Tutor"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invite.createdAt).toLocaleDateString(
                          "it-IT",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(invite.expiresAt).toLocaleDateString(
                          "it-IT",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {invite.usedBy ? (
                          <span>
                            {invite.usedBy.name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({invite.usedBy.email})
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
