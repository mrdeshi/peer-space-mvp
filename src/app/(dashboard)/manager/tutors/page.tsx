import Link from "next/link";
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
import { buttonVariants } from "@/lib/button-variants";

export default async function TutorsPage() {
  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR" },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          tutorSubjects: true,
          lessonsAsTutor: true,
        },
      },
      ratingsReceived: {
        where: { score: { not: null } },
        select: { score: true },
      },
    },
  });

  const tutorsWithStats = tutors.map((tutor) => {
    const ratings = tutor.ratingsReceived.filter((r) => r.score !== null);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + (r.score ?? 0), 0) / ratings.length
        : null;

    return {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      active: tutor.active,
      subjectCount: tutor._count.tutorSubjects,
      lessonCount: tutor._count.lessonsAsTutor,
      avgRating,
      ratingCount: ratings.length,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestione Tutor</h2>

      <Card>
        <CardHeader>
          <CardTitle>Tutor ({tutorsWithStats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tutorsWithStats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessun tutor registrato. Crea un codice invito per aggiungere tutor.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Materie</TableHead>
                  <TableHead>Lezioni completate</TableHead>
                  <TableHead>Valutazione media</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorsWithStats.map((tutor) => (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{tutor.name}</TableCell>
                    <TableCell>{tutor.email}</TableCell>
                    <TableCell>
                      <Badge variant={tutor.active ? "default" : "destructive"}>
                        {tutor.active ? "Attivo" : "Disattivato"}
                      </Badge>
                    </TableCell>
                    <TableCell>{tutor.subjectCount}</TableCell>
                    <TableCell>{tutor.lessonCount}</TableCell>
                    <TableCell>
                      {tutor.avgRating !== null ? (
                        <span>
                          {tutor.avgRating.toFixed(1)}/5{" "}
                          <span className="text-xs text-muted-foreground">
                            ({tutor.ratingCount} valutazioni)
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/manager/tutors/${tutor.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Dettaglio
                      </Link>
                    </TableCell>
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
