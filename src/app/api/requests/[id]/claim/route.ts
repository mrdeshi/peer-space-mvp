import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  _req: Request,
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
        { error: "Solo i tutor possono prendere in carico le richieste" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const request = await prisma.tutoringRequest.findUnique({
      where: { id },
      include: { subject: true },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Richiesta non trovata" },
        { status: 404 }
      );
    }

    if (request.status !== "OPEN") {
      return NextResponse.json(
        { error: "La richiesta non è più disponibile" },
        { status: 400 }
      );
    }

    // Verify tutor has the required subject
    const tutorSubject = await prisma.tutorSubject.findUnique({
      where: {
        tutorId_subjectId: {
          tutorId: session.user.id,
          subjectId: request.subjectId,
        },
      },
    });

    if (!tutorSubject) {
      return NextResponse.json(
        { error: "Non sei qualificato per questa materia" },
        { status: 403 }
      );
    }

    const chatToken = uuidv4();

    // Update request and create system message in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.tutoringRequest.update({
        where: { id },
        data: {
          status: "CLAIMED",
          claimedById: session.user!.id,
          claimedAt: new Date(),
          chatToken,
        },
        include: {
          subject: true,
          claimedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.message.create({
        data: {
          requestId: id,
          senderRole: "SYSTEM",
          content: `La richiesta è stata presa in carico da ${session.user!.name}.`,
        },
      });

      return updatedRequest;
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Errore nella presa in carico della richiesta" },
      { status: 500 }
    );
  }
}
