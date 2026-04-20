import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
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

    const { id } = await params;

    const request = await prisma.tutoringRequest.findUnique({
      where: { id },
      include: {
        subject: true,
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
        lesson: true,
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        rating: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Richiesta non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch {
    return NextResponse.json(
      { error: "Errore nel recupero della richiesta" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["OPEN", "CLAIMED", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Stato non valido" },
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

    const updated = await prisma.tutoringRequest.update({
      where: { id },
      data: { status },
      include: {
        subject: true,
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Errore nell'aggiornamento della richiesta" },
      { status: 500 }
    );
  }
}
