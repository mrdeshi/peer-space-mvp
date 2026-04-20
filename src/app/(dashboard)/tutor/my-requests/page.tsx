import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";

function timeAgo(date: Date | string | null): string {
  if (!date) return "-";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);

  if (diffH < 1) return "meno di 1h fa";
  if (diffH < 24) return `${diffH}h fa`;
  if (diffD === 1) return "ieri";
  if (diffD < 7) return `${diffD}g fa`;
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}

export default async function MyRequestsPage() {
  const session = await auth();
  const tutorId = session!.user.id;

  const requests = await prisma.tutoringRequest.findMany({
    where: {
      claimedById: tutorId,
      status: { in: ["CLAIMED", "COMPLETED"] },
    },
    orderBy: { claimedAt: "desc" },
    include: {
      subject: { select: { name: true } },
      lesson: { select: { durationMin: true, date: true } },
      rating: { select: { score: true } },
    },
  });

  const claimed = requests.filter((r) => r.status === "CLAIMED");
  const completed = requests.filter((r) => r.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Le Mie Richieste</h2>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-lg font-semibold text-foreground">Nessuna richiesta</p>
          <p className="text-sm text-muted-foreground mt-1">
            Non hai ancora accettato nessuna richiesta.
          </p>
        </div>
      ) : (
        <>
          {/* Active requests */}
          {claimed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--ps-accent)] animate-pulse" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  In corso ({claimed.length})
                </h3>
              </div>
              <div className="grid gap-3">
                {claimed.map((request, i) => (
                  <Link
                    key={request.id}
                    href={`/tutor/my-requests/${request.id}`}
                    className="group block rounded-2xl border-2 border-[var(--ps-accent)]/20 bg-card p-4 transition-all hover:border-[var(--ps-accent)]/50 hover:shadow-md animate-fade-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-start gap-3">
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">
                            {request.studentName}
                          </p>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {request.subject.name}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{request.requestNumber}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {timeAgo(request.claimedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        Tocca per dettaglio e chat
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-[var(--ps-accent)] transition-colors">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Completed requests */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Completate ({completed.length})
              </h3>
              <div className="grid gap-3">
                {completed.map((request, i) => (
                  <Link
                    key={request.id}
                    href={`/tutor/my-requests/${request.id}`}
                    className="group block rounded-2xl border border-border bg-card p-4 transition-all hover:border-border hover:shadow-sm animate-fade-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold opacity-70"
                        style={{
                          backgroundColor: `hsl(${(request.requestNumber * 47) % 360}, 40%, 92%)`,
                          color: `hsl(${(request.requestNumber * 47) % 360}, 30%, 45%)`,
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">
                            {request.studentName}
                          </p>
                          <StatusBadge status={request.status} />
                          {request.rating?.score && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <span className="text-yellow-500">★</span>
                              {request.rating.score}/5
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {request.subject.name}
                          {request.lesson && (
                            <span> · {request.lesson.durationMin}min</span>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground transition-colors">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
