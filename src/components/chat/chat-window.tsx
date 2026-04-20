"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  id: string;
  senderRole: string;
  content: string;
  createdAt: string;
  sender?: { name: string } | null;
}

interface ChatWindowProps {
  requestId: string;
  chatToken?: string;
  currentRole: "TUTOR" | "STUDENT" | "MANAGER";
}

export function ChatWindow({
  requestId,
  chatToken,
  currentRole,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [connectionLost, setConnectionLost] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const pollFailCountRef = useRef(0);

  const buildQueryParams = useCallback(
    (since?: string | null) => {
      const params = new URLSearchParams({ requestId });
      if (chatToken) params.set("chatToken", chatToken);
      if (since) params.set("since", since);
      return params.toString();
    },
    [requestId, chatToken]
  );

  const fetchMessages = useCallback(async () => {
    try {
      const query = buildQueryParams(lastTimestampRef.current);
      const res = await fetch(`/api/messages?${query}`);
      if (!res.ok) {
        pollFailCountRef.current += 1;
        if (pollFailCountRef.current >= 3) {
          setConnectionLost(true);
        }
        return;
      }

      // Reset failure count on success
      pollFailCountRef.current = 0;
      setConnectionLost(false);

      const data: Message[] = await res.json();
      if (data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = data.filter((m) => !existingIds.has(m.id));
          if (newMessages.length === 0) return prev;
          return [...prev, ...newMessages];
        });
        lastTimestampRef.current = data[data.length - 1].createdAt;
      }
    } catch {
      pollFailCountRef.current += 1;
      if (pollFailCountRef.current >= 3) {
        setConnectionLost(true);
      }
    } finally {
      setInitialLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          content: input.trim(),
          chatToken: chatToken || undefined,
        }),
      });

      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
        lastTimestampRef.current = msg.createdAt;
        setInput("");
      } else {
        toast.error("Errore nell'invio del messaggio");
      }
    } catch {
      toast.error("Errore nell'invio del messaggio");
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 border rounded-t-lg bg-muted/20">
        {initialLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Caricamento messaggi...
          </p>
        )}
        {!initialLoading && messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nessun messaggio ancora. Inizia la conversazione!
          </p>
        )}
        {messages.map((msg) => {
          const isSystem = msg.senderRole === "SYSTEM";
          const isTutor = msg.senderRole === "TUTOR" || msg.senderRole === "MANAGER";
          const isStudent = msg.senderRole === "STUDENT";

          // Determine alignment based on current user's role
          const isOwnMessage =
            (currentRole === "TUTOR" && msg.senderRole === "TUTOR") ||
            (currentRole === "STUDENT" && msg.senderRole === "STUDENT") ||
            (currentRole === "MANAGER" && msg.senderRole === "MANAGER");

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <p className="text-xs text-muted-foreground italic">
                  {msg.content}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  isTutor
                    ? "bg-blue-500 text-white"
                    : isStudent
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-80">
                  {msg.sender?.name ??
                    (isStudent ? "Studente" : msg.senderRole)}
                </p>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isTutor ? "text-blue-100" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection lost warning */}
      {connectionLost && (
        <div className="px-3 py-1.5 text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-x">
          Connessione persa. I messaggi si aggiorneranno quando la connessione viene ripristinata.
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 p-3 border border-t-0 rounded-b-lg bg-background"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi un messaggio..."
          disabled={sending}
          className="flex-1"
        />
        <Button type="submit" disabled={sending || !input.trim()}>
          {sending ? "..." : "Invia"}
        </Button>
      </form>
    </div>
  );
}
