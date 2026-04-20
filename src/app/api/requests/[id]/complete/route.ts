import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { checkCompletionRules } from "@/lib/business-rules";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    if (session.user.role !== "TUTOR") {
      return NextResponse.json(
        { error: "Solo i tutor possono completare le richieste" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { date, durationMin, location, notes } = body;

    if (!date || !durationMin) {
      return NextResponse.json(
        { error: "Data e durata sono obbligatori" },
        { status: 400 }
      );
    }

    const request = await prisma.tutoringRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Richiesta non trovata" },
        { status: 404 }
      );
    }

    if (request.status !== "CLAIMED") {
      return NextResponse.json(
        { error: "La richiesta deve essere in stato CLAIMED per essere completata" },
        { status: 400 }
      );
    }

    if (request.claimedById !== session.user.id) {
      return NextResponse.json(
        { error: "Solo il tutor che ha preso in carico la richiesta può completarla" },
        { status: 403 }
      );
    }

    // Check business rules
    const violations = await checkCompletionRules(
      request.studentEmail,
      request.subjectId,
      new Date(date),
      Number(durationMin)
    );

    if (violations.length > 0) {
      return NextResponse.json(
        {
          error: "Regole di business violate",
          violations,
        },
        { status: 400 }
      );
    }

    const ratingToken = uuidv4();

    const result = await prisma.$transaction(async (tx) => {
      // Create the lesson
      const lesson = await tx.lesson.create({
        data: {
          requestId: id,
          tutorId: session.user!.id,
          date: new Date(date),
          durationMin: Number(durationMin),
          location: location || "Campus Est SUPSI",
          notes: notes || null,
        },
      });

      // Update request status
      await tx.tutoringRequest.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      // Create rating with null score (pending)
      await tx.rating.create({
        data: {
          requestId: id,
          tutorId: session.user!.id,
          studentToken: ratingToken,
        },
      });

      return lesson;
    });

    return NextResponse.json({
      lesson: result,
      ratingToken,
    });
  } catch {
    return NextResponse.json(
      { error: "Errore nel completamento della richiesta" },
      { status: 500 }
    );
  }
}
