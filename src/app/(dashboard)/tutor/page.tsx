import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function TutorDashboard() {
  const session = await auth();
  const tutorId = session!.user.id;

  const [claimedRequests, completedLessons, totalHours, subjects] =
    await Promise.all([
      prisma.tutoringRequest.count({
        where: { claimedById: tutorId, status: "CLAIMED" },
      }),
      prisma.lesson.count({ where: { tutorId } }),
      prisma.lesson.aggregate({
        where: { tutorId },
        _sum: { durationMin: true },
      }),
      prisma.tutorSubject.count({ where: { tutorId } }),
    ]);

  const hours = Math.round((totalHours._sum.durationMin || 0) / 60 * 10) / 10;

  const stats = [
    { label: "Richieste in corso", value: claimedRequests },
    { label: "Lezioni completate", value: completedLessons },
    { label: "Ore totali", value: hours },
    { label: "Materie assegnate", value: subjects },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Tutor</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
