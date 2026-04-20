import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, score, comment } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token obbligatorio" },
        { status: 400 }
      );
    }

    if (!score || score < 1 || score > 5 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: "Il punteggio deve essere un intero tra 1 e 5" },
        { status: 400 }
      );
    }

    // Find the rating by studentToken
    const rating = await prisma.rating.findUnique({
      where: { studentToken: token },
    });

    if (!rating) {
      return NextResponse.json(
        { error: "Token non valido" },
        { status: 404 }
      );
    }

    if (rating.score !== null) {
      return NextResponse.json(
        { error: "Valutazione già inviata" },
        { status: 400 }
      );
    }

    // Update the rating
    const updated = await prisma.rating.update({
      where: { studentToken: token },
      data: {
        score,
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Errore nell'invio della valutazione" },
      { status: 500 }
    );
  }
}
