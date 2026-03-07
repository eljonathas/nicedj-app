import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Lock, Play, Plus, Search, Users2, AudioLines } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { CreateRoomModal } from "../components/room/CreateRoomModal";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
});

interface RoomData {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  ownerUsername: string;
  capacity: number;
  isPrivate: boolean;
  activeUsersCount: number;
  activeUsers: Array<{
    id: string;
    username: string;
    avatar: string | null;
  }>;
  currentPlayback: {
    title: string;
    artist: string;
    thumbnailUrl: string | null;
  } | null;
}

export function RoomsPage() {
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await api<RoomData[]>("/api/rooms");
        setRooms(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar salas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filtered = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.name.toLowerCase().includes(search.toLowerCase()) ||
          room.description.toLowerCase().includes(search.toLowerCase())
      ),
    [rooms, search]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-8 lg:px-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <header className="surface-card rounded-[1.8rem] p-5 md:p-7 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="pill inline-flex items-center gap-2 border-[rgba(10,132,255,0.34)] bg-[rgba(9,28,46,0.75)] text-[#78bcff]">
                <AudioLines className="h-3.5 w-3.5" />
                Descoberta em tempo real
              </span>
              <h1 className="section-title mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Salas ativas</h1>
              <p className="mt-2 max-w-xl text-sm md:text-base text-[var(--text-secondary)]">
                Entre em comunidades com estilos diferentes, acompanhe o DJ da vez e participe do ranking da sala.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:min-w-[380px]">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar sala, estilo, comunidade..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[rgba(21,29,41,0.82)] pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[rgba(30,215,96,0.28)] focus:border-[rgba(30,215,96,0.5)]"
                />
              </label>

              {user && (
                <Button size="md" onClick={() => setIsModalOpen(true)} className="sm:min-w-[150px]">
                  <Plus className="h-4 w-4" />
                  Nova sala
                </Button>
              )}
            </div>
          </div>
        </header>
      </motion.div>

      {loading && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[184px] animate-pulse rounded-3xl border border-[var(--border-light)] bg-[rgba(18,25,36,0.75)]" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-[rgba(255,97,88,0.3)] bg-[rgba(57,17,18,0.5)] p-5 text-[var(--danger)] flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Não foi possível carregar as salas</p>
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <Link
                to="/room/$slug"
                params={{ slug: room.slug }}
                className="group block overflow-hidden rounded-3xl border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(20,27,38,0.93),rgba(11,16,24,0.95))] p-5 transition-all hover:-translate-y-0.5 hover:border-[rgba(30,215,96,0.45)] hover:shadow-[0_20px_44px_rgba(2,7,16,0.55)]"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[rgba(16,24,34,0.95)]">
                    {room.currentPlayback?.thumbnailUrl ? (
                      <img
                        src={room.currentPlayback.thumbnailUrl}
                        alt={room.currentPlayback.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(30,215,96,0.2),transparent_65%)] opacity-0 transition-opacity group-hover:opacity-100" />
                        <Play className="relative h-6 w-6 text-[var(--accent-hover)]" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(4,6,10,0.88))] px-2 py-1">
                      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                        {room.currentPlayback ? 'Ao vivo' : 'Sem set'}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-[var(--text-primary)]">{room.name}</h3>
                      {room.isPrivate && <Lock className="h-3.5 w-3.5 text-[var(--warning)]" />}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--text-muted)]">
                      <span className="truncate">Host {room.ownerUsername}</span>
                      <span className="text-[rgba(255,255,255,0.22)]">•</span>
                      <span>{room.activeUsersCount} ativos</span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">
                      {room.description || "Sala sem descrição. Entre para descobrir o som da comunidade."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Tocando agora
                    </p>
                    <p className="truncate text-[13px] font-semibold text-white">
                      {room.currentPlayback?.title ?? 'Sem set no ar'}
                    </p>
                    <p className="truncate text-[11px] text-[var(--text-secondary)]">
                      {room.currentPlayback?.artist ?? 'Aguardando o próximo DJ'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      {room.activeUsers.slice(0, 4).map((activeUser, avatarIndex) => (
                        <div
                          key={activeUser.id}
                          className={avatarIndex === 0 ? '' : '-ml-2'}
                        >
                          <Avatar
                            username={activeUser.username}
                            src={activeUser.avatar}
                            size="sm"
                            className="h-7 w-7 border border-[rgba(8,12,18,0.9)] ring-0"
                          />
                        </div>
                      ))}
                      {room.activeUsersCount === 0 && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[rgba(14,20,30,0.82)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                          <Users2 className="h-3.5 w-3.5 text-[var(--accent-alt)]" />
                          Vazia
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-hover)]">Entrar</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-12 rounded-3xl border border-[var(--border-light)] bg-[rgba(16,22,31,0.82)] p-10 text-center">
          <p className="section-title text-2xl font-bold">Nenhuma sala encontrada</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {search ? "Tente ajustar os termos da busca." : "Ainda não existem salas públicas disponíveis."}
          </p>
          {user && (
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              Criar primeira sala
            </Button>
          )}
        </div>
      )}

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(slug) => {
          setIsModalOpen(false);
          navigate({ to: `/room/${slug}` });
        }}
      />
    </div>
  );
}
