import { create } from "zustand";

interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: string;
}

interface ChatState {
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    clearMessages: () => void;
}

const MAX_MESSAGES = 200;

export const useChatStore = create<ChatState>((set) => ({
    messages: [],

    addMessage: (msg) =>
        set((s) => ({
            messages: [...s.messages.slice(-(MAX_MESSAGES - 1)), msg],
        })),

    clearMessages: () => set({ messages: [] }),
}));
