import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId, content, chatToken } = body;

    if (!requestId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "requestId e content sono obbligatori" },
        { status: 400 }
      );
    }

    let senderRole: string;
    let senderId: string | null = null;

    if (chatToken) {
      // Student access via chatToken
      const request = await prisma.tutoringRequest.findUnique({
        where: { id: requestId },
        select: { chatToken: true },
      });

      if (!request || request.chatToken !== chatToken) {
        return NextResponse.json(
          { error: "Token chat non valido" },
          { status: 401 }
        );
      }

      senderRole = "STUDENT";
    } else {
      // Authenticated user access
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: "Non autenticato" },
          { status: 401 }
        );
      }

      senderId = session.user.id;
      senderRole = session.user.role === "MANAGER" ? "MANAGER" : "TUTOR";
    }

    const message = await prisma.message.create({
      data: {
        requestId,
        senderId,
        senderRole,
        content: content.trim(),
      },
      include: {
        sender: { select: { name: true } },
      },
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json(
      { error: "Errore nell'invio del messaggio" },
      { status: 500 }
    );
  }
}
