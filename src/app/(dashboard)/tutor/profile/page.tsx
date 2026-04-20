import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function TutorProfilePage() {
  const session = await auth();
  const tutorId = session!.user.id;

  const [user, subjects, ratingAgg, recentLessons] = await Promise.all([
    prisma.user.findUnique({
      where: { id: tutorId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.tutorSubject.findMany({
      where: { tutorId },
      include: { subject: { select: { name: true } } },
    }),
    prisma.rating.aggregate({
      where: { tutorId, score: { not: null } },
      _avg: { score: true },
      _count: { score: true },
    }),
    prisma.lesson.findMany({
      where: { tutorId },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: {
        request: {
          select: {
            requestNumber: true,
            studentName: true,
            subject: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  if (!user) return null;

  const avgRating = ratingAgg._avg.score;
  const ratingCount = ratingAgg._count.score;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Il Mio Profilo</h2>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Personali</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Membro dal</dt>
              <dd className="font-medium">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Materie Assegnate</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna materia assegnata. Contatta un manager.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((ts) => (
                <Badge key={ts.id} variant="secondary">
                  {ts.subject.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Valutazione Media</CardTitle>
        </CardHeader>
        <CardContent>
          {ratingCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna valutazione ricevuta ancora.
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                {avgRating !== null ? avgRating.toFixed(1) : "-"}
              </span>
              <span className="text-2xl">
                {"★".repeat(Math.round(avgRating ?? 0))}
                {"☆".repeat(5 - Math.round(avgRating ?? 0))}
              </span>
              <span className="text-sm text-muted-foreground">
                ({ratingCount} {ratingCount === 1 ? "valutazione" : "valutazioni"})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Lezioni Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessuna lezione completata.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N.</TableHead>
                  <TableHead>Studente</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Durata</TableHead>
                  <TableHead>Luogo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-mono font-medium">
                      #{lesson.request.requestNumber}
                    </TableCell>
                    <TableCell>{lesson.request.studentName}</TableCell>
                    <TableCell>{lesson.request.subject.name}</TableCell>
                    <TableCell>{formatDate(lesson.date)}</TableCell>
                    <TableCell>{lesson.durationMin} min</TableCell>
                    <TableCell>{lesson.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
