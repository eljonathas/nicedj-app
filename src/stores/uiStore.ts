import { create } from "zustand";

interface UIState {
    isMobile: boolean;
    sidebarOpen: boolean;
    activePanel: "chat" | "users" | "queue";
    modalOpen: string | null;

    setIsMobile: (value: boolean) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (value: boolean) => void;
    setActivePanel: (panel: "chat" | "users" | "queue") => void;
    openModal: (id: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    sidebarOpen: true,
    activePanel: "chat",
    modalOpen: null,

    setIsMobile: (value) => set({ isMobile: value }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (value) => set({ sidebarOpen: value }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    openModal: (id) => set({ modalOpen: id }),
    closeModal: () => set({ modalOpen: null }),
}));
