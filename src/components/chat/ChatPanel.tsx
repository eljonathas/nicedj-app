import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Send } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { Avatar } from "../ui/Avatar";

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const wsClient = useAuthStore((s) => s.wsClient);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages.length]);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    wsClient?.send("send_chat", { content: trimmed });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-[rgba(10,13,19,0.92)]">
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1.5">
        {messages.length === 0 && (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center px-4">
            <div className="h-9 w-9 rounded-xl bg-[rgba(29,185,84,0.14)] text-[var(--accent-hover)] flex items-center justify-center mb-2.5">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">Sem mensagens ainda</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">Comece a conversa com a sala.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.article
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-start gap-2"
            >
              <Avatar username={msg.username} size="sm" className="h-6 w-6 text-[10px] mt-0.5" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[11px] font-semibold text-[var(--text-primary)]">{msg.username}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <p className="mt-0.5 break-words rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(20,24,33,0.88)] px-2.5 py-1.5 text-[12px] leading-[1.35] text-[var(--text-secondary)] shadow-[0_8px_18px_rgba(0,0,0,0.28)]">
                  {msg.content}
                </p>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] px-2.5 py-2">
        <form onSubmit={handleSend} className="flex items-center gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Mensagem..."
            maxLength={255}
            className="h-9 flex-1 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(16,20,28,0.95)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(255,255,255,0.24)]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-9 w-9 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(31,36,47,0.95)] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(40,46,60,1)] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            aria-label="Enviar mensagem"
          >
            <Send className="mx-auto h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
