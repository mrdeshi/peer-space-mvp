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

export default async function ReportsPage() {
  // Get all tutors with their lesson stats
  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR", active: true },
    include: {
      lessonsAsTutor: true,
      ratingsReceived: {
        where: { score: { not: null } },
      },
    },
    orderBy: { name: "asc" },
  });

  const tutorStats = tutors.map((tutor) => {
    const totalMinutes = tutor.lessonsAsTutor.reduce(
      (sum, l) => sum + l.durationMin,
      0
    );
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const reimbursement = Math.round((totalMinutes / 60) * 20 * 100) / 100;
    const avgRating =
      tutor.ratingsReceived.length > 0
        ? Math.round(
            (tutor.ratingsReceived.reduce((sum, r) => sum + (r.score || 0), 0) /
              tutor.ratingsReceived.length) *
              10
          ) / 10
        : null;

    return {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      lessonsCount: tutor.lessonsAsTutor.length,
      totalHours,
      reimbursement,
      avgRating,
    };
  });

  const grandTotalHours = tutorStats.reduce((sum, t) => sum + t.totalHours, 0);
  const grandTotalReimbursement = tutorStats.reduce(
    (sum, t) => sum + t.reimbursement,
    0
  );
  const grandTotalLessons = tutorStats.reduce(
    (sum, t) => sum + t.lessonsCount,
    0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Report Rimborsi</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lezioni totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{grandTotalLessons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ore totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{grandTotalHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rimborso totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              CHF {grandTotalReimbursement.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettaglio per Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Lezioni</TableHead>
                <TableHead className="text-center">Ore</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-right">Rimborso (CHF)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutorStats.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className="font-medium">{tutor.name}</TableCell>
                  <TableCell>{tutor.email}</TableCell>
                  <TableCell className="text-center">
                    {tutor.lessonsCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {tutor.totalHours}h
                  </TableCell>
                  <TableCell className="text-center">
                    {tutor.avgRating ? `${tutor.avgRating}/5` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {tutor.reimbursement.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {tutorStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nessun tutor trovato
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
