import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ManagerDashboard() {
  const [totalRequests, openRequests, completedRequests, activeTutors] =
    await Promise.all([
      prisma.tutoringRequest.count(),
      prisma.tutoringRequest.count({ where: { status: "OPEN" } }),
      prisma.tutoringRequest.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "TUTOR", active: true } }),
    ]);

  const stats = [
    { label: "Richieste totali", value: totalRequests },
    { label: "Richieste aperte", value: openRequests },
    { label: "Lezioni completate", value: completedRequests },
    { label: "Tutor attivi", value: activeTutors },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Manager</h2>
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
