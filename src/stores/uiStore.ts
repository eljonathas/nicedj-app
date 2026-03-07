import { create } from "zustand";

interface UIState {
    isMobile: boolean;
    sidebarOpen: boolean;
    activePanel: "chat" | "users" | "queue";
    modalOpen: string | null;
    roomSidebarWidth: number;
    floatingPanel: {
        view: "rooms" | "playlists" | "friends" | "shop" | "profile";
        profileId?: string | null;
    } | null;

    setIsMobile: (value: boolean) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (value: boolean) => void;
    setActivePanel: (panel: "chat" | "users" | "queue") => void;
    setRoomSidebarWidth: (value: number) => void;
    openModal: (id: string) => void;
    closeModal: () => void;
    openFloatingPanel: (
        view: "rooms" | "playlists" | "friends" | "shop" | "profile",
        options?: { profileId?: string | null }
    ) => void;
    closeFloatingPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    sidebarOpen: true,
    activePanel: "chat",
    modalOpen: null,
    roomSidebarWidth: 336,
    floatingPanel: null,

    setIsMobile: (value) => set({ isMobile: value }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (value) => set({ sidebarOpen: value }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    setRoomSidebarWidth: (value) => set({ roomSidebarWidth: value }),
    openModal: (id) => set({ modalOpen: id }),
    closeModal: () => set({ modalOpen: null }),
    openFloatingPanel: (view, options) =>
        set({
            floatingPanel: {
                view,
                profileId: options?.profileId ?? null,
            },
        }),
    closeFloatingPanel: () => set({ floatingPanel: null }),
}));
