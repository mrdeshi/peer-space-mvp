import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { StatusBadge } from "@/components/shared/status-badge";

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.tutoringRequest.findUnique({
    where: { id },
    include: {
      subject: true,
      claimedBy: {
        select: { id: true, name: true, email: true },
      },
      lesson: true,
      rating: {
        select: { score: true, comment: true, createdAt: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { name: true, role: true } },
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  // Build status timeline
  const timeline: { label: string; date: string; active: boolean }[] = [
    {
      label: "Creata",
      date: formatDateTime(request.createdAt),
      active: true,
    },
  ];

  if (request.claimedAt) {
    timeline.push({
      label: `Presa in carico da ${request.claimedBy?.name ?? "tutor"}`,
      date: formatDateTime(request.claimedAt),
      active: true,
    });
  }

  if (request.lesson) {
    timeline.push({
      label: "Lezione completata",
      date: formatDateTime(request.lesson.completedAt),
      active: true,
    });
  }

  if (request.status === "CANCELLED") {
    timeline.push({
      label: "Cancellata",
      date: formatDateTime(request.updatedAt),
      active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/manager/requests" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Torna alla lista
        </Link>
        <h2 className="text-2xl font-bold">
          Richiesta #{request.requestNumber}
        </h2>
        <StatusBadge status={request.status} />
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Studente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium">{request.studentName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{request.studentEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Corso di laurea</dt>
              <dd className="font-medium">{request.degreeProgram}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Anno</dt>
              <dd className="font-medium">{request.academicYear}° anno</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli Richiesta</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Materia</dt>
              <dd className="font-medium">{request.subject.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Data preferita</dt>
              <dd className="font-medium">
                {formatDate(request.preferredDate)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Creata il</dt>
              <dd className="font-medium">{formatDateTime(request.createdAt)}</dd>
            </div>
            {request.claimedBy && (
              <div>
                <dt className="text-muted-foreground">Presa in carico da</dt>
                <dd className="font-medium">
                  <Link
                    href={`/manager/tutors/${request.claimedBy.id}`}
                    className="text-primary hover:underline"
                  >
                    {request.claimedBy.name}
                  </Link>{" "}
                  <span className="text-xs text-muted-foreground">
                    ({request.claimedBy.email})
                  </span>
                </dd>
              </div>
            )}
            {request.notes && (
              <div className="col-span-full">
                <dt className="text-muted-foreground">Note</dt>
                <dd className="font-medium whitespace-pre-wrap">
                  {request.notes}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Cronologia Stato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                    event.active
                      ? "bg-primary"
                      : "border-2 border-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lesson Info */}
      {request.lesson && (
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Lezione</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Data lezione</dt>
                <dd className="font-medium">
                  {formatDate(request.lesson.date)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Durata</dt>
                <dd className="font-medium">
                  {request.lesson.durationMin} minuti
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Luogo</dt>
                <dd className="font-medium">{request.lesson.location}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rimborso</dt>
                <dd className="font-medium">
                  CHF {request.lesson.reimbursementCHF.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Completata il</dt>
                <dd className="font-medium">
                  {formatDateTime(request.lesson.completedAt)}
                </dd>
              </div>
              {request.lesson.notes && (
                <div className="col-span-full">
                  <dt className="text-muted-foreground">Note lezione</dt>
                  <dd className="font-medium whitespace-pre-wrap">
                    {request.lesson.notes}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      {request.rating && (
        <Card>
          <CardHeader>
            <CardTitle>Valutazione</CardTitle>
          </CardHeader>
          <CardContent>
            {request.rating.score !== null ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {request.rating.score}/5
                  </span>
                  <span className="text-sm text-muted-foreground">
                    - ricevuta il{" "}
                    {formatDate(request.rating.createdAt)}
                  </span>
                </div>
                {request.rating.comment && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {request.rating.comment}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Valutazione in attesa dallo studente.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages / Chat Log */}
      <Card>
        <CardHeader>
          <CardTitle>
            Messaggi ({request.messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {request.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessun messaggio in questa conversazione.
            </p>
          ) : (
            <div className="space-y-4">
              {request.messages.map((message) => {
                const isSystem = message.senderRole === "SYSTEM";
                const isStudent = message.senderRole === "STUDENT";
                const isTutor = message.senderRole === "TUTOR";

                return (
                  <div
                    key={message.id}
                    className={`rounded-lg border p-3 ${
                      isSystem
                        ? "bg-muted/50 border-dashed"
                        : isStudent
                        ? "bg-blue-50/50 dark:bg-blue-950/20"
                        : isTutor
                        ? "bg-green-50/50 dark:bg-green-950/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            isSystem
                              ? "outline"
                              : isStudent
                              ? "secondary"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {isSystem
                            ? "Sistema"
                            : isStudent
                            ? "Studente"
                            : message.sender?.name ?? "Tutor"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
