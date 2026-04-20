import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const subjectId = searchParams.get("subjectId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (subjectId) where.subjectId = subjectId;

    const requests = await prisma.tutoringRequest.findMany({
      where,
      include: {
        subject: true,
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json(
      { error: "Errore nel recupero delle richieste" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const {
      studentName,
      studentEmail,
      degreeProgram,
      academicYear,
      subjectId,
      preferredDate,
      notes,
    } = body;

    if (!studentName || !studentEmail || !degreeProgram || !academicYear || !subjectId) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 }
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

    // Auto-generate requestNumber as max + 1
    const maxRequest = await prisma.tutoringRequest.findFirst({
      orderBy: { requestNumber: "desc" },
      select: { requestNumber: true },
    });
    const requestNumber = (maxRequest?.requestNumber ?? 0) + 1;

    const request = await prisma.tutoringRequest.create({
      data: {
        requestNumber,
        studentName,
        studentEmail,
        degreeProgram,
        academicYear,
        subjectId,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        notes: notes || null,
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Errore nella creazione della richiesta" },
      { status: 500 }
    );
  }
}
