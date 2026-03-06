import { motion } from "framer-motion";
import { Crown, Mic2, UserRound } from "lucide-react";
import { useRoomStore } from "../../stores/roomStore";
import { Avatar } from "../ui/Avatar";

export function UserList() {
  const users = useRoomStore((s) => s.users);

  if (users.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="h-10 w-10 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(16,21,30,0.95)] text-[var(--text-muted)] flex items-center justify-center mb-2.5">
          <UserRound className="h-4.5 w-4.5" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Sem usuários conectados</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-2.5 py-2 space-y-1.5">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.16, delay: index * 0.015 }}
          className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,29,0.95)] px-2.5 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.24)]"
        >
          <Avatar username={user.username} src={user.avatar} size="sm" className="h-7 w-7" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-[var(--text-primary)]">{user.username}</p>
            {user.role !== "guest" ? (
              <div className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(8,12,18,0.9)] px-1.5 py-0.5">
                {user.role === "host" && <Crown className="h-2.5 w-2.5 text-[var(--warning)]" />}
                <span className={`text-[9px] font-semibold uppercase tracking-[0.08em] ${user.role === "host" ? "text-[var(--warning)]" : "text-[var(--accent-hover)]"}`}>
                  {user.role}
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--text-muted)]">online</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function DJQueue() {
  const queue = useRoomStore((s) => s.queue);
  const users = useRoomStore((s) => s.users);

  const getUser = (userId: string) => users.find((user) => user.id === userId);

  if (queue.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="h-10 w-10 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(16,21,30,0.95)] text-[var(--text-muted)] flex items-center justify-center mb-2.5">
          <Mic2 className="h-4.5 w-4.5" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Fila vazia</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-2.5 py-2 space-y-1.5">
      {queue.map((userId, index) => {
        const user = getUser(userId);
        const username = user?.username || userId;

        return (
          <motion.div
            key={userId}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.16, delay: index * 0.015 }}
            className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,29,0.95)] px-2.5 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.24)]"
          >
            <div className="h-6 w-6 shrink-0 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(8,12,18,0.9)] text-[10px] font-bold text-[var(--text-secondary)] flex items-center justify-center">
              {index + 1}
            </div>

            <Avatar username={username} src={user?.avatar} size="sm" className="h-7 w-7" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[var(--text-primary)]">{username}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{index === 0 ? "DJ atual" : "na fila"}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
