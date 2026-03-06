import { createRootRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Disc3, LayoutGrid, ListMusic, Loader2, LogOut, Radio, ShoppingBag, User2, Users } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useRoomStore } from "../stores/roomStore";

export const Route = createRootRoute({
  component: RootLayout,
});

const navItems = [
  { to: "/rooms", icon: LayoutGrid, label: "Salas" },
  { to: "/playlists", icon: ListMusic, label: "Playlists" },
  { to: "/friends", icon: Users, label: "Amigos" },
  { to: "/shop", icon: ShoppingBag, label: "Loja" },
];

function RootLayout() {
  const { user, logout, initialized, initialize } = useAuthStore();
  const activeRoom = useRoomStore((s) => s.activeRoom);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isMarketingPage = location.pathname === "/";

  if (isAuthPage || isMarketingPage) {
    return (
      <div className="min-h-screen shell-background text-[var(--text-primary)]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen shell-background text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-[82px] md:flex-col border-r border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <div className="flex h-full flex-col items-center justify-between py-4">
            <div className="flex w-full flex-col items-center gap-4 px-2">
              <Link to="/" className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[#031208]">
                  <Disc3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-[13px] font-bold tracking-tight text-white">NiceDJ</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Live</p>
                </div>
              </Link>

              <nav className="flex w-full flex-col items-center gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={item.label}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                        isActive
                          ? "border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.86)] text-[var(--accent-hover)]"
                          : "border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </Link>
                  );
                })}
              </nav>

              {activeRoom && (
                <div className="flex w-full flex-col items-center gap-1.5 pt-1">
                  <Link
                    to="/room/$slug"
                    params={{ slug: activeRoom.slug }}
                    title={activeRoom.name}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                      location.pathname === `/room/${activeRoom.slug}`
                        ? "border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.86)] text-[var(--accent-hover)]"
                        : "border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    <Radio className="h-4.5 w-4.5" />
                  </Link>
                  <span className="line-clamp-2 px-1 text-center text-[8px] font-medium leading-3 text-[var(--text-muted)]">
                    {activeRoom.name}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full px-2">
              {user ? (
                <div className="flex flex-col items-center gap-2">
                  <Link
                    to="/profile/$id"
                    params={{ id: user.id }}
                    title={user.username}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] transition-colors hover:text-white"
                  >
                    <User2 className="h-4.5 w-4.5" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-muted)] transition-colors hover:border-[rgba(255,97,88,0.3)] hover:text-[var(--danger)]"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex h-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[11px] font-semibold text-[#031208] transition-all hover:brightness-110"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 min-w-0 flex-col">
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-40 border-b border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-2.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[var(--accent)] text-[#031208] flex items-center justify-center">
                <Disc3 className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold tracking-tight">NiceDJ</span>
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg border border-[var(--border-light)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--danger)] flex items-center justify-center cursor-pointer"
                aria-label="Sair"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </header>

          {/* Mobile Bottom Tab Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-light)] bg-[var(--bg-secondary)] flex items-center justify-around py-2 px-1">
            {[
              { to: "/rooms" as const, icon: LayoutGrid, label: "Salas" },
              { to: "/playlists" as const, icon: ListMusic, label: "Playlists" },
              { to: "/friends" as const, icon: Users, label: "Social" },
              { to: "/shop" as const, icon: ShoppingBag, label: "Loja" },
            ].map((t) => {
              const active = location.pathname === t.to;
              return (
                <Link key={t.to} to={t.to}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
                >
                  <t.icon className="h-5 w-5" />
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
