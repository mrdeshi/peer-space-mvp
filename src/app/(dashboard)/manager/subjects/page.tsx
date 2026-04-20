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
import { AddSubjectForm, DeleteSubjectButton } from "./subject-actions";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          tutorSubjects: true,
          requests: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestione Materie</h2>

      <AddSubjectForm />

      <Card>
        <CardHeader>
          <CardTitle>Materie ({subjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessuna materia presente. Aggiungi la prima materia.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tutor assegnati</TableHead>
                  <TableHead>Richieste</TableHead>
                  <TableHead>Creata il</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">
                      {subject.name}
                    </TableCell>
                    <TableCell>{subject._count.tutorSubjects}</TableCell>
                    <TableCell>{subject._count.requests}</TableCell>
                    <TableCell>
                      {new Date(subject.createdAt).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteSubjectButton
                        subjectId={subject.id}
                        subjectName={subject.name}
                        hasRelations={
                          subject._count.tutorSubjects > 0 ||
                          subject._count.requests > 0
                        }
                      />
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
