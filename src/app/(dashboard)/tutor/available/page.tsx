import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ClaimButton } from "./claim-button";
import { ViewToggle } from "./view-toggle";
import { SwipeableCards } from "@/components/requests/swipeable-cards";

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}

function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ora";
  if (diffMin < 60) return `${diffMin}min fa`;
  if (diffH < 24) return `${diffH}h fa`;
  if (diffD === 1) return "ieri";
  return `${diffD}g fa`;
}

export default async function AvailableRequestsPage() {
  const session = await auth();
  const tutorId = session!.user.id;

  const tutorSubjects = await prisma.tutorSubject.findMany({
    where: { tutorId },
    select: { subjectId: true },
  });

  const subjectIds = tutorSubjects.map((ts) => ts.subjectId);

  const requests = await prisma.tutoringRequest.findMany({
    where: {
      status: "OPEN",
      subjectId: { in: subjectIds },
    },
    orderBy: { createdAt: "asc" },
    include: {
      subject: { select: { name: true } },
    },
  });

  if (requests.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Disponibili</h2>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-lg font-semibold text-foreground">Nessuna richiesta</p>
          <p className="text-sm text-muted-foreground mt-1">
            Non ci sono richieste disponibili per le tue materie al momento.
          </p>
        </div>
      </div>
    );
  }

  // Serialize for client component
  const serializedRequests = requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    studentName: r.studentName,
    studentEmail: r.studentEmail,
    degreeProgram: r.degreeProgram,
    academicYear: r.academicYear,
    subjectName: r.subject.name,
    preferredDate: r.preferredDate?.toISOString() ?? null,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  }));

  const listView = (
    <div className="grid gap-3">
      {requests.map((request, i) => (
        <div
          key={request.id}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-[var(--ps-accent)]/40 hover:shadow-md animate-fade-up"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <Badge
              className="text-xs font-semibold"
              style={{
                backgroundColor: "var(--ps-accent-light)",
                color: "var(--ps-accent)",
              }}
            >
              {request.subject.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo(request.createdAt)}
            </span>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{
                backgroundColor: `hsl(${(request.requestNumber * 47) % 360}, 50%, 92%)`,
                color: `hsl(${(request.requestNumber * 47) % 360}, 40%, 35%)`,
              }}
            >
              {request.studentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground leading-tight">
                {request.studentName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {request.degreeProgram} · {request.academicYear}° anno
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono text-muted-foreground">
              #{request.requestNumber}
            </span>
          </div>

          {request.notes && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              &ldquo;{request.notes}&rdquo;
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {formatDate(request.preferredDate)}
              </span>
            </div>
            <ClaimButton requestId={request.id} />
          </div>
        </div>
      ))}
    </div>
  );

  const swipeView = <SwipeableCards requests={serializedRequests} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Disponibili</h2>
        <Badge variant="outline" className="text-sm">
          {requests.length} {requests.length === 1 ? "richiesta" : "richieste"}
        </Badge>
      </div>

      <ViewToggle listView={listView} swipeView={swipeView} />
    </div>
  );
}
