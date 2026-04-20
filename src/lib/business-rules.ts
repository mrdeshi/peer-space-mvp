import { prisma } from "./prisma";

interface RuleViolation {
  rule: string;
  message: string;
}

/**
 * Check all business rules before completing a lesson.
 * Returns an array of violations (empty = all good).
 */
export async function checkCompletionRules(
  studentEmail: string,
  subjectId: string,
  date: Date,
  durationMin: number
): Promise<RuleViolation[]> {
  const violations: RuleViolation[] = [];

  // Rule: max 60 min duration
  if (durationMin > 60) {
    violations.push({
      rule: "MAX_DURATION",
      message: "La durata massima è di 60 minuti per lezione",
    });
  }

  // Rule: max 1h per student per subject per day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const sameDayLessons = await prisma.lesson.findMany({
    where: {
      request: { studentEmail, subjectId },
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  const sameDayMinutes = sameDayLessons.reduce(
    (sum, l) => sum + l.durationMin,
    0
  );

  if (sameDayMinutes + durationMin > 60) {
    violations.push({
      rule: "MAX_1H_PER_DAY",
      message: `Lo studente ha già ${sameDayMinutes} minuti di ${sameDayMinutes > 0 ? "questa materia" : ""} oggi. Massimo 1 ora per materia al giorno.`,
    });
  }

  // Rule: max 3h per student per week (non-consecutive days)
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekLessons = await prisma.lesson.findMany({
    where: {
      request: { studentEmail },
      date: { gte: weekStart, lte: weekEnd },
    },
    orderBy: { date: "asc" },
  });

  const weekMinutes = weekLessons.reduce((sum, l) => sum + l.durationMin, 0);

  if (weekMinutes + durationMin > 180) {
    violations.push({
      rule: "MAX_3H_PER_WEEK",
      message: `Lo studente ha già ${Math.round(weekMinutes / 60 * 10) / 10} ore questa settimana. Massimo 3 ore a settimana.`,
    });
  }

  // Rule: non-consecutive days
  const lessonDates = weekLessons.map((l) => {
    const d = new Date(l.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const currentDay = new Date(date);
  currentDay.setHours(0, 0, 0, 0);
  const currentDayTime = currentDay.getTime();

  // Check if the previous or next day already has a lesson
  const prevDay = currentDayTime - 86400000;
  const nextDay = currentDayTime + 86400000;

  if (lessonDates.includes(prevDay) || lessonDates.includes(nextDay)) {
    violations.push({
      rule: "NON_CONSECUTIVE",
      message:
        "Le lezioni non devono essere in giorni consecutivi per lo stesso studente.",
    });
  }

  return violations;
}

/**
 * Check if a tutor is approved for a subject.
 */
export async function isTutorApprovedForSubject(
  tutorId: string,
  subjectId: string
): Promise<boolean> {
  const ts = await prisma.tutorSubject.findUnique({
    where: { tutorId_subjectId: { tutorId, subjectId } },
  });
  return !!ts;
}

/**
 * Get the next request number.
 */
export async function getNextRequestNumber(): Promise<number> {
  const last = await prisma.tutoringRequest.findFirst({
    orderBy: { requestNumber: "desc" },
    select: { requestNumber: true },
  });
  return (last?.requestNumber ?? 0) + 1;
}
