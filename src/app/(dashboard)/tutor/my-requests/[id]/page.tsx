import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { StatusBadge } from "@/components/shared/status-badge";
import { CompleteLessonDialog } from "./complete-lesson-dialog";
import { ChatWindow } from "@/components/chat/chat-window";
import { CopyStudentLink } from "./copy-student-link";

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

export default async function TutorRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tutorId = session!.user.id;

  const request = await prisma.tutoringRequest.findUnique({
    where: { id },
    include: {
      subject: true,
      claimedBy: { select: { id: true, name: true } },
      lesson: true,
      rating: { select: { score: true, comment: true } },
    },
  });

  if (!request || request.claimedById !== tutorId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tutor/my-requests" className={buttonVariants({ variant: "outline", size: "sm" })}>
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
              <dt className="text-muted-foreground">Presa in carico il</dt>
              <dd className="font-medium">
                {formatDateTime(request.claimedAt)}
              </dd>
            </div>
            {request.notes && (
              <div className="col-span-full">
                <dt className="text-muted-foreground">Note dello studente</dt>
                <dd className="font-medium whitespace-pre-wrap">
                  {request.notes}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Actions */}
      {request.status === "CLAIMED" && (
        <Card>
          <CardHeader>
            <CardTitle>Azioni</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <CompleteLessonDialog requestId={request.id} />
            {request.chatToken && (
              <CopyStudentLink chatToken={request.chatToken} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Lesson Info if completed */}
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
                  <span className="text-2xl">
                    {"★".repeat(request.rating.score)}
                    {"☆".repeat(5 - request.rating.score)}
                  </span>
                  <span className="text-lg font-bold">
                    {request.rating.score}/5
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

      {/* Chat */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat con lo studente</CardTitle>
          {request.chatToken && request.status !== "CLAIMED" && (
            <CopyStudentLink chatToken={request.chatToken} />
          )}
        </CardHeader>
        <CardContent>
          <ChatWindow
            requestId={request.id}
            currentRole="TUTOR"
          />
        </CardContent>
      </Card>
    </div>
  );
}
