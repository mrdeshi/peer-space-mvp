"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RequestData {
  id: string;
  requestNumber: number;
  studentName: string;
  studentEmail: string;
  degreeProgram: string;
  academicYear: string;
  subjectName: string;
  preferredDate: string | null;
  notes: string | null;
  createdAt: string;
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 60) return `${diffMin}min fa`;
  if (diffH < 24) return `${diffH}h fa`;
  if (diffD === 1) return "ieri";
  return `${diffD}g fa`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SwipeableCards({ requests }: { requests: RequestData[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 100;

  const handleClaim = useCallback(
    async (requestId: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/requests/${requestId}/claim`, {
          method: "POST",
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Errore");
          setLoading(false);
          return false;
        }
        toast.success("Richiesta accettata!");
        router.refresh();
        return true;
      } catch {
        toast.error("Errore di rete");
        setLoading(false);
        return false;
      }
    },
    [router]
  );

  const animateExit = useCallback(
    (direction: "left" | "right") => {
      setExitDirection(direction);

      if (direction === "right" && requests[currentIndex]) {
        handleClaim(requests[currentIndex].id).then((success) => {
          if (!success) {
            setExitDirection(null);
            setDragX(0);
          }
        });
      }

      setTimeout(() => {
        if (direction === "left") {
          setCurrentIndex((prev) => prev + 1);
        }
        setExitDirection(null);
        setDragX(0);
        setLoading(false);
      }, 300);
    },
    [currentIndex, handleClaim, requests]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    if (loading) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || loading) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontal.current) {
      e.preventDefault();
      setDragX(dx);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging || loading) return;
    setIsDragging(false);

    if (Math.abs(dragX) > THRESHOLD) {
      animateExit(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
    isHorizontal.current = null;
  };

  // Mouse events for desktop testing
  const onMouseDown = (e: React.MouseEvent) => {
    if (loading) return;
    startX.current = e.clientX;
    setIsDragging(true);
    isHorizontal.current = true;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || loading) return;
    setDragX(e.clientX - startX.current);
  };

  const onMouseUp = () => {
    if (!isDragging || loading) return;
    setIsDragging(false);
    if (Math.abs(dragX) > THRESHOLD) {
      animateExit(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  };

  if (currentIndex >= requests.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <p className="text-lg font-semibold">Hai visto tutte le richieste!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Torna più tardi per nuove richieste.
        </p>
      </div>
    );
  }

  const current = requests[currentIndex];
  const next = requests[currentIndex + 1];

  // Calculate visual feedback
  const rotation = dragX * 0.08;
  const opacity = Math.min(Math.abs(dragX) / THRESHOLD, 1);
  const isRight = dragX > 0;

  const getExitTransform = () => {
    if (exitDirection === "right") return "translateX(120%) rotate(15deg)";
    if (exitDirection === "left") return "translateX(-120%) rotate(-15deg)";
    return `translateX(${dragX}px) rotate(${rotation}deg)`;
  };

  return (
    <div className="space-y-4">
      {/* Hint */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Salta
        </span>
        <span className="text-muted-foreground/50">swipe</span>
        <span className="flex items-center gap-1">
          Accetta
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>

      {/* Card stack */}
      <div
        className="relative mx-auto"
        style={{ height: 380, maxWidth: 400, touchAction: "pan-y" }}
      >
        {/* Next card (behind) */}
        {next && (
          <div
            className="absolute inset-0 rounded-3xl border border-border bg-card p-5"
            style={{
              transform: "scale(0.95) translateY(8px)",
              opacity: 0.5,
              zIndex: 0,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className="text-xs font-semibold"
                style={{
                  backgroundColor: "var(--ps-accent-light)",
                  color: "var(--ps-accent)",
                }}
              >
                {next.subjectName}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted" />
              <div>
                <p className="font-semibold text-foreground">{next.studentName}</p>
                <p className="text-sm text-muted-foreground">{next.degreeProgram}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current card */}
        <div
          ref={cardRef}
          className="absolute inset-0 rounded-3xl border-2 border-border bg-card p-5 cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: getExitTransform(),
            transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
            zIndex: 1,
            borderColor: isDragging
              ? isRight
                ? `rgba(34, 197, 94, ${opacity})`
                : `rgba(239, 68, 68, ${opacity * 0.5})`
              : undefined,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Swipe indicators */}
          {isDragging && Math.abs(dragX) > 30 && (
            <div
              className="absolute top-6 z-10 rounded-xl px-4 py-2 text-lg font-bold border-2"
              style={{
                ...(isRight
                  ? {
                      left: 16,
                      color: "rgb(34, 197, 94)",
                      borderColor: "rgb(34, 197, 94)",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      transform: `rotate(-12deg)`,
                      opacity,
                    }
                  : {
                      right: 16,
                      color: "rgb(156, 163, 175)",
                      borderColor: "rgb(156, 163, 175)",
                      backgroundColor: "rgba(156, 163, 175, 0.1)",
                      transform: `rotate(12deg)`,
                      opacity,
                    }),
              }}
            >
              {isRight ? "ACCETTA ✓" : "SALTA →"}
            </div>
          )}

          {/* Card content */}
          <div className="flex items-center justify-between mb-4">
            <Badge
              className="text-xs font-semibold"
              style={{
                backgroundColor: "var(--ps-accent-light)",
                color: "var(--ps-accent)",
              }}
            >
              {current.subjectName}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo(current.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold"
              style={{
                backgroundColor: `hsl(${(current.requestNumber * 47) % 360}, 50%, 92%)`,
                color: `hsl(${(current.requestNumber * 47) % 360}, 40%, 35%)`,
              }}
            >
              {getInitials(current.studentName)}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{current.studentName}</p>
              <p className="text-sm text-muted-foreground">
                {current.degreeProgram} · {current.academicYear}° anno
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Data preferita: {formatDate(current.preferredDate)}
          </div>

          {current.notes && (
            <div className="rounded-xl bg-muted/50 p-3 mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                &ldquo;{current.notes}&rdquo;
              </p>
            </div>
          )}

          <div className="text-xs font-mono text-muted-foreground text-center">
            #{current.requestNumber} · {current.studentEmail}
          </div>

          {/* Progress */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{currentIndex + 1} / {requests.length}</span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / requests.length) * 100}%`,
                  backgroundColor: "var(--ps-accent)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          onClick={() => animateExit("left")}
          disabled={loading}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground transition-all hover:border-muted-foreground hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button
          onClick={() => animateExit("right")}
          disabled={loading}
          className="flex h-16 w-16 items-center justify-center rounded-full text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--ps-accent), var(--ps-accent-dark))",
            boxShadow: "0 4px 20px var(--ps-accent-glow)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
