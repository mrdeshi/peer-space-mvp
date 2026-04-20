import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    const since = searchParams.get("since");
    const chatToken = searchParams.get("chatToken");

    if (!requestId) {
      return NextResponse.json(
        { error: "requestId obbligatorio" },
        { status: 400 }
      );
    }

    // Auth: either session or valid chatToken
    let authorized = false;

    const session = await auth();
    if (session?.user) {
      authorized = true;
    }

    if (!authorized && chatToken) {
      const request = await prisma.tutoringRequest.findUnique({
        where: { id: requestId },
        select: { chatToken: true },
      });

      if (request && request.chatToken === chatToken) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const where: { requestId: string; createdAt?: { gt: Date } } = {
      requestId,
    };

    if (since) {
      where.createdAt = { gt: new Date(since) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { name: true } },
      },
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "Errore nel caricamento dei messaggi" },
      { status: 500 }
    );
  }
}
