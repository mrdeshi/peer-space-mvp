import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function StudentChatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const request = await prisma.tutoringRequest.findUnique({
    where: { chatToken: token },
    include: {
      subject: { select: { name: true } },
      claimedBy: { select: { name: true } },
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-2xl px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Chat Tutoring</h1>
          <p className="text-muted-foreground">
            Richiesta #{request.requestNumber}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli della richiesta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Studente</dt>
                <dd className="font-medium">{request.studentName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Materia</dt>
                <dd className="font-medium">{request.subject.name}</dd>
              </div>
              {request.claimedBy && (
                <div>
                  <dt className="text-muted-foreground">Tutor</dt>
                  <dd className="font-medium">{request.claimedBy.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Stato</dt>
                <dd>
                  <Badge
                    variant={
                      request.status === "COMPLETED" ? "secondary" : "default"
                    }
                  >
                    {request.status === "CLAIMED"
                      ? "In corso"
                      : request.status === "COMPLETED"
                      ? "Completata"
                      : request.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messaggi</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatWindow
              requestId={request.id}
              chatToken={token}
              currentRole="STUDENT"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
