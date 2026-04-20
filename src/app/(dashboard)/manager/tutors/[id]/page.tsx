import { notFound } from "next/navigation";
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
import {
  AddTutorSubjectForm,
  RemoveTutorSubjectButton,
} from "./tutor-subject-actions";

export default async function TutorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tutor = await prisma.user.findUnique({
    where: { id, role: "TUTOR" },
    include: {
      tutorSubjects: {
        include: { subject: true },
        orderBy: { subject: { name: "asc" } },
      },
      lessonsAsTutor: {
        include: {
          request: {
            select: {
              requestNumber: true,
              studentName: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      },
      ratingsReceived: {
        where: { score: { not: null } },
        select: { score: true },
      },
    },
  });

  if (!tutor) {
    notFound();
  }

  // Get all subjects to determine which ones can still be assigned
  const allSubjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const assignedSubjectIds = new Set(
    tutor.tutorSubjects.map((ts) => ts.subjectId)
  );
  const availableSubjects = allSubjects.filter(
    (s) => !assignedSubjectIds.has(s.id)
  );

  // Compute average rating
  const ratings = tutor.ratingsReceived.filter((r) => r.score !== null);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.score ?? 0), 0) / ratings.length
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/manager/tutors" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Torna alla lista
        </Link>
        <h2 className="text-2xl font-bold">{tutor.name}</h2>
        <Badge variant={tutor.active ? "default" : "destructive"}>
          {tutor.active ? "Attivo" : "Disattivato"}
        </Badge>
      </div>

      {/* Tutor Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{tutor.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Registrato il</dt>
              <dd className="font-medium">
                {new Date(tutor.createdAt).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Lezioni completate</dt>
              <dd className="font-medium">{tutor.lessonsAsTutor.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Valutazione media</dt>
              <dd className="font-medium">
                {avgRating !== null
                  ? `${avgRating.toFixed(1)}/5 (${ratings.length} valutazioni)`
                  : "Nessuna valutazione"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Assigned Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>
            Materie Assegnate ({tutor.tutorSubjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddTutorSubjectForm
            tutorId={tutor.id}
            availableSubjects={availableSubjects}
          />

          {tutor.tutorSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Nessuna materia assegnata a questo tutor.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Materia</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutor.tutorSubjects.map((ts) => (
                  <TableRow key={ts.id}>
                    <TableCell className="font-medium">
                      {ts.subject.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <RemoveTutorSubjectButton
                        tutorId={tutor.id}
                        subjectId={ts.subjectId}
                        subjectName={ts.subject.name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Completed Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lezioni Completate ({tutor.lessonsAsTutor.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tutor.lessonsAsTutor.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessuna lezione completata.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N. Richiesta</TableHead>
                  <TableHead>Studente</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Durata (min)</TableHead>
                  <TableHead>Luogo</TableHead>
                  <TableHead>Rimborso (CHF)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutor.lessonsAsTutor.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <Link
                        href={`/manager/requests/${lesson.requestId}`}
                        className="text-primary hover:underline"
                      >
                        #{lesson.request.requestNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{lesson.request.studentName}</TableCell>
                    <TableCell>{lesson.request.subject.name}</TableCell>
                    <TableCell>
                      {new Date(lesson.date).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{lesson.durationMin}</TableCell>
                    <TableCell>{lesson.location}</TableCell>
                    <TableCell>
                      CHF {lesson.reimbursementCHF.toFixed(2)}
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
