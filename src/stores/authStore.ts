import { create } from "zustand";
import { api } from "../lib/api";
import { WsClient } from "../lib/ws";

interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    wsClient: WsClient | null;
    initialized: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    setError: (error: string | null) => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem("nicedj_token"),
    isLoading: false,
    error: null,
    wsClient: null,
    initialized: false,

    initialize: async () => {
        const { token, user, wsClient, initialized } = get();
        if (initialized) return;
        if (!token) {
            set({ initialized: true });
            return;
        }

        if (user && wsClient) {
            set({ initialized: true });
            return;
        }

        try {
            const result = await api<{ userId: string; username: string; email: string; avatar: string | null }>("/api/auth/me", { token });

            const ws = new WsClient(token);
            ws.connect();

            set({
                user: { id: result.userId, username: result.username, email: result.email, avatar: result.avatar },
                wsClient: ws,
                initialized: true,
            });
        } catch {
            localStorage.removeItem("nicedj_token");
            set({ token: null, user: null, wsClient: null, initialized: true });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const result = await api<{ accessToken: string; refreshToken: string; user: User }>(
                "/api/auth/login",
                { method: "POST", body: { email, password } }
            );
            localStorage.setItem("nicedj_token", result.accessToken);

            const wsClient = new WsClient(result.accessToken);
            wsClient.connect();

            set({ token: result.accessToken, user: result.user, isLoading: false, wsClient, initialized: true });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            await api("/api/auth/register", {
                method: "POST",
                body: { username, email, password },
            });
            await get().login(email, password);
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    logout: () => {
        const { wsClient } = get();
        wsClient?.disconnect();
        localStorage.removeItem("nicedj_token");
        set({ user: null, token: null, wsClient: null });
    },

    setError: (error) => set({ error }),
}));
