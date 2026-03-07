import { create } from "zustand";

interface ChatMessage {
    roomId?: string;
    id: string;
    userId: string;
    username: string;
    avatar?: string | null;
    role?: string | null;
    platformRole?: string | null;
    content: string;
    timestamp: string;
    system?: boolean;
}

interface ChatState {
    roomId: string | null;
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    setMessages: (roomId: string, messages: ChatMessage[]) => void;
    clearMessages: () => void;
}

const MAX_MESSAGES = 200;

export const useChatStore = create<ChatState>((set) => ({
    roomId: null,
    messages: [],

    addMessage: (msg) =>
        set((s) => ({
            roomId: msg.roomId ?? s.roomId,
            messages: [...s.messages.slice(-(MAX_MESSAGES - 1)), msg],
        })),

    setMessages: (roomId, messages) =>
        set({
            roomId,
            messages: messages.slice(-MAX_MESSAGES),
        }),

    clearMessages: () => set({ roomId: null, messages: [] }),
}));
