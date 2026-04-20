import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function generateCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
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

    const invites = await prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch {
    return NextResponse.json(
      { error: "Errore nel recupero dei codici invito" },
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
    const { role } = body;

    const validRoles = ["TUTOR", "MANAGER"];
    const assignedRole = validRoles.includes(role) ? role : "TUTOR";

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let code = generateCode();
    // Ensure uniqueness
    while (await prisma.inviteCode.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const invite = await prisma.inviteCode.create({
      data: {
        code,
        role: assignedRole,
        expiresAt,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Errore nella creazione del codice invito" },
      { status: 500 }
    );
  }
}
