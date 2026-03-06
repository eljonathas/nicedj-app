import { motion } from "framer-motion";
import { ArrowRight, Heart, LogIn, LogOut as LogOutIcon, ThumbsDown, ThumbsUp } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useRoomStore } from "../../stores/roomStore";
import { Button } from "../ui/Button";

interface VoteBarProps {
  showQueueAction?: boolean;
  floating?: boolean;
}

export function VoteBar({ showQueueAction = true, floating = false }: VoteBarProps) {
  const { isInQueue, isCurrentDJ, queueLength, handleToggleQueue, handleVote, votes } = useVoteBarState();

  if (floating) {
    return (
      <div className="flex items-center gap-2 rounded-[1.4rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(8,12,18,0.78)] p-2 shadow-[0_18px_34px_rgba(0,0,0,0.42)] backdrop-blur-[14px]">
        <VoteButton type="woot" label="Woot" value={votes.woots} onClick={() => handleVote("woot")} icon={ThumbsUp} compact />
        <VoteButton type="grab" label="Grab" value={votes.grabs} onClick={() => handleVote("grab")} icon={Heart} compact />
        <VoteButton type="meh" label="Meh" value={votes.mehs} onClick={() => handleVote("meh")} icon={ThumbsDown} compact />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {showQueueAction &&
          (isCurrentDJ ? (
            <Button variant="danger" onClick={handleToggleQueue}>
              Sair do booth
              <LogOutIcon className="h-4 w-4" />
            </Button>
          ) : isInQueue ? (
            <Button variant="secondary" onClick={handleToggleQueue}>
              Sair da fila
              <LogOutIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleToggleQueue}>
              Entrar na fila
              <LogIn className="h-4 w-4" />
            </Button>
          ))}
      </div>

      <div className="grid grid-cols-3 gap-2 lg:min-w-[320px]">
        <VoteButton type="woot" label="Woot" value={votes.woots} onClick={() => handleVote("woot")} icon={ThumbsUp} />
        <VoteButton type="grab" label="Grab" value={votes.grabs} onClick={() => handleVote("grab")} icon={Heart} />
        <VoteButton type="meh" label="Meh" value={votes.mehs} onClick={() => handleVote("meh")} icon={ThumbsDown} />
      </div>

      <div className="hidden min-w-[150px] items-center justify-end lg:flex">
        {queueLength > 0 && !isCurrentDJ && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[rgba(17,24,34,0.84)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            Fila {queueLength}
            <ArrowRight className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function QueueActionButton() {
  const { isInQueue, isCurrentDJ, handleToggleQueue, queueLength } = useVoteBarState();

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={handleToggleQueue}
      className={`flex min-w-[168px] items-center justify-between gap-3 rounded-[1.35rem] border px-4 py-3 text-left shadow-[0_18px_34px_rgba(0,0,0,0.42)] backdrop-blur-[14px] transition-all ${
        isCurrentDJ
          ? "border-[rgba(255,97,88,0.3)] bg-[rgba(68,17,19,0.78)] text-[rgba(255,214,211,0.94)]"
          : isInQueue
            ? "border-[rgba(255,255,255,0.14)] bg-[rgba(12,17,24,0.82)] text-white"
            : "border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.82)] text-[var(--accent-hover)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-current/15 bg-black/15">
          {isCurrentDJ || isInQueue ? <LogOutIcon className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        </div>
        <div>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-current/70">
            {isCurrentDJ ? "Booth ativo" : "Sua vez"}
          </span>
          <span className="block text-[13px] font-semibold">
            {isCurrentDJ ? "Sair do booth" : isInQueue ? "Sair da fila" : "Entrar na fila"}
          </span>
        </div>
      </div>
      <span className="rounded-full border border-current/15 bg-black/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
        {isCurrentDJ ? "No ar" : `Fila ${queueLength}`}
      </span>
    </motion.button>
  );
}

function useVoteBarState() {
  const votes = useRoomStore((s) => s.votes);
  const queue = useRoomStore((s) => s.queue);
  const playbackDjId = useRoomStore((s) => s.playback?.djId);
  const user = useAuthStore((s) => s.user);
  const wsClient = useAuthStore((s) => s.wsClient);

  const isInQueue = Boolean(user?.id && queue.includes(user.id));
  const isCurrentDJ = playbackDjId === user?.id;

  const handleVote = (type: "woot" | "meh" | "grab") => {
    wsClient?.send("vote", { type });
  };

  const handleToggleQueue = () => {
    if (isInQueue) {
      wsClient?.send("leave_queue");
      return;
    }

    wsClient?.send("join_queue");
  };

  return { votes, isInQueue, isCurrentDJ, queueLength: queue.length, handleToggleQueue, handleVote };
}

function VoteButton({
  type,
  label,
  value,
  onClick,
  icon: Icon,
  compact = false,
}: {
  type: "woot" | "grab" | "meh";
  label: string;
  value: number;
  onClick: () => void;
  icon: typeof ThumbsUp;
  compact?: boolean;
}) {
  const theme =
    type === "woot"
      ? "border-[rgba(55,210,124,0.3)] bg-[rgba(55,210,124,0.12)] text-[var(--success)]"
      : type === "grab"
        ? "border-[rgba(255,181,71,0.28)] bg-[rgba(255,181,71,0.12)] text-[var(--warning)]"
        : "border-[rgba(255,97,88,0.3)] bg-[rgba(255,97,88,0.12)] text-[var(--danger)]";

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border transition-all ${theme} flex flex-col items-center justify-center ${
        compact ? "h-14 w-14 gap-0.5" : "h-16 gap-0.5"
      } ${compact ? "" : "min-w-[94px]"}`}
    >
      <Icon className={compact ? "h-4 w-4" : "h-4 w-4"} />
      <span className={compact ? "text-[9px] font-semibold uppercase tracking-[0.1em]" : "text-[10px] font-semibold uppercase tracking-[0.1em]"}>
        {label}
      </span>
      <span className={compact ? "text-sm font-bold" : "text-sm font-bold"}>{value}</span>
    </motion.button>
  );
}
