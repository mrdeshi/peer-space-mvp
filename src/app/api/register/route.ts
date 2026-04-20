import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { inviteCode, name, email, password } = body;

  if (!inviteCode || !name || !email || !password) {
    return NextResponse.json(
      { error: "Tutti i campi sono obbligatori" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La password deve avere almeno 6 caratteri" },
      { status: 400 }
    );
  }

  // Validate invite code
  const invite = await prisma.inviteCode.findUnique({
    where: { code: inviteCode.toUpperCase() },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Codice invito non valido" },
      { status: 400 }
    );
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { error: "Codice invito già utilizzato" },
      { status: 400 }
    );
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json(
      { error: "Codice invito scaduto" },
      { status: 400 }
    );
  }

  // Check if email is already registered
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email già registrata" },
      { status: 400 }
    );
  }

  // Create user and mark invite as used
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashSync(password, 10),
      role: invite.role,
    },
  });

  await prisma.inviteCode.update({
    where: { id: invite.id },
    data: { usedById: user.id, usedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
