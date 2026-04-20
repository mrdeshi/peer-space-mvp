import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR", active: true },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        tutorSubjects: {
          include: {
            subject: true,
          },
        },
        lessonsAsTutor: {
          select: { id: true },
        },
        ratingsReceived: {
          where: { score: { not: null } },
          select: { score: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = tutors.map((tutor) => {
      const totalLessons = tutor.lessonsAsTutor.length;
      const ratings = tutor.ratingsReceived.filter((r) => r.score !== null);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + (r.score ?? 0), 0) / ratings.length
          : null;

      return {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        createdAt: tutor.createdAt,
        subjects: tutor.tutorSubjects.map((ts) => ts.subject),
        totalLessons,
        avgRating: avgRating !== null ? Math.round(avgRating * 100) / 100 : null,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Errore nel recupero dei tutor" },
      { status: 500 }
    );
  }
}
