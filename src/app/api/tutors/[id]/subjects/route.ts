import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    if (session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const { id: tutorId } = await params;
    const body = await req.json();
    const { subjectId } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId è obbligatorio" },
        { status: 400 }
      );
    }

    // Verify tutor exists and is a tutor
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
    });

    if (!tutor || tutor.role !== "TUTOR") {
      return NextResponse.json(
        { error: "Tutor non trovato" },
        { status: 404 }
      );
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Materia non trovata" },
        { status: 404 }
      );
    }

    // Check if already assigned
    const existing = await prisma.tutorSubject.findUnique({
      where: {
        tutorId_subjectId: { tutorId, subjectId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Materia già assegnata a questo tutor" },
        { status: 409 }
      );
    }

    const tutorSubject = await prisma.tutorSubject.create({
      data: { tutorId, subjectId },
      include: { subject: true },
    });

    return NextResponse.json(tutorSubject, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Errore nell'assegnazione della materia" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const { id: tutorId } = await params;
    const body = await req.json();
    const { subjectId } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId è obbligatorio" },
        { status: 400 }
      );
    }

    const tutorSubject = await prisma.tutorSubject.findUnique({
      where: {
        tutorId_subjectId: { tutorId, subjectId },
      },
    });

    if (!tutorSubject) {
      return NextResponse.json(
        { error: "Assegnazione non trovata" },
        { status: 404 }
      );
    }

    await prisma.tutorSubject.delete({
      where: { id: tutorSubject.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Errore nella rimozione della materia" },
      { status: 500 }
    );
  }
}
