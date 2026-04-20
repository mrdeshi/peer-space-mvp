import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subjects);
  } catch {
    return NextResponse.json(
      { error: "Errore nel recupero delle materie" },
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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Il nome della materia è obbligatorio" },
        { status: 400 }
      );
    }

    const existing = await prisma.subject.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Materia già esistente" },
        { status: 409 }
      );
    }

    const subject = await prisma.subject.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Errore nella creazione della materia" },
      { status: 500 }
    );
  }
}
