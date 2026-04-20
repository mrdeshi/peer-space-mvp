import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RateForm } from "./rate-form";

export default async function RatingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const rating = await prisma.rating.findUnique({
    where: { studentToken: token },
    include: {
      tutor: { select: { name: true } },
      request: {
        select: {
          requestNumber: true,
          studentName: true,
          subject: { select: { name: true } },
        },
      },
    },
  });

  if (!rating) {
    notFound();
  }

  // Already rated
  if (rating.score !== null) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
        <div className="mx-auto max-w-md px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Grazie!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl">
                {"★".repeat(rating.score)}
                {"☆".repeat(5 - rating.score)}
              </div>
              <p className="text-muted-foreground">
                Hai valutato la tua lezione di{" "}
                <strong>{rating.request.subject.name}</strong> con{" "}
                <strong>{rating.tutor.name}</strong> con un punteggio di{" "}
                <strong>{rating.score}/5</strong>.
              </p>
              {rating.comment && (
                <p className="text-sm text-muted-foreground italic">
                  &quot;{rating.comment}&quot;
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                La tua valutazione è stata registrata. Grazie per il tuo feedback!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show rating form
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
      <div className="mx-auto max-w-md px-4 w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Valutazione Lezione</h1>
          <p className="text-muted-foreground">
            Ciao {rating.request.studentName}! Valuta la tua lezione.
          </p>
        </div>

        <RateForm
          token={token}
          tutorName={rating.tutor.name}
          subjectName={rating.request.subject.name}
        />
      </div>
    </div>
  );
}
