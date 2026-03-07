import { create } from "zustand";

interface RoomUser {
    id: string;
    username: string;
    avatar: string | null;
    role: string;
    platformRole?: string | null;
}

interface Playback {
    trackId: string;
    source: "youtube" | "soundcloud";
    sourceId: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    durationMs: number;
    startedAtServerMs: number;
    paused: boolean;
    pauseOffsetMs: number;
    serverTimeMs: number;
    djId: string;
    djUsername: string;
    clientSyncAtMs?: number;
}

interface Votes {
    woots: number;
    mehs: number;
    grabs: number;
    wootUserIds: string[];
}

interface RoomInfo {
    id: string;
    name: string;
    slug: string;
    description: string;
    ownerId: string;
    ownerUsername?: string;
    queueLocked?: boolean;
}

interface ActiveRoomShortcut {
    id: string;
    name: string;
    slug: string;
}

interface RoomState {
    room: RoomInfo | null;
    activeRoom: ActiveRoomShortcut | null;
    users: RoomUser[];
    queue: string[];
    playback: Playback | null;
    votes: Votes;
    isInQueue: boolean;
    wootBursts: Record<string, number>;
    errorMessage: string | null;
    playerVolume: number;

    setRoom: (room: RoomInfo | null) => void;
    setUsers: (users: RoomUser[]) => void;
    addUser: (user: RoomUser) => void;
    updateUserAvatar: (userId: string, avatar: string | null) => void;
    removeUser: (userId: string) => void;
    setQueue: (queue: string[]) => void;
    setPlayback: (playback: Playback | null) => void;
    setVotes: (votes: Votes) => void;
    updateVote: (type: "woot" | "meh" | "grab", delta: number) => void;
    setIsInQueue: (value: boolean) => void;
    setErrorMessage: (message: string | null) => void;
    setPlayerVolume: (value: number) => void;
    markWootBurst: (userId: string) => void;
    clearWootBurst: (userId: string) => void;
    setWootBursts: (userIds: string[]) => void;
    reset: () => void;
}

function getInitialPlayerVolume() {
    if (typeof window === "undefined") {
        return 70;
    }

    const stored = window.localStorage.getItem("nicedj:player-volume");
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 70;
}

const initialState = {
    room: null,
    activeRoom: null,
    users: [],
    queue: [],
    playback: null,
    votes: { woots: 0, mehs: 0, grabs: 0, wootUserIds: [] },
    isInQueue: false,
    wootBursts: {},
    errorMessage: null,
    playerVolume: getInitialPlayerVolume(),
};

export const useRoomStore = create<RoomState>((set) => ({
    ...initialState,

    setRoom: (room) =>
        set((state) => ({
            room,
            activeRoom: room
                ? {
                    id: room.id,
                    name: room.name,
                    slug: room.slug,
                }
                : state.activeRoom,
        })),
    setUsers: (users) => set({ users }),
    addUser: (user) =>
        set((s) => {
            const existingIndex = s.users.findIndex((u) => u.id === user.id);
            if (existingIndex >= 0) {
                const nextUsers = [...s.users];
                nextUsers[existingIndex] = { ...nextUsers[existingIndex], ...user };
                return { users: nextUsers };
            }
            return { users: [...s.users, user] };
        }),
    updateUserAvatar: (userId, avatar) =>
        set((s) => ({
            users: s.users.map((user) =>
                user.id === userId
                    ? { ...user, avatar }
                    : user
            ),
        })),
    removeUser: (userId) => set((s) => ({ users: s.users.filter((u) => u.id !== userId) })),
    setQueue: (queue) => set({ queue }),
    setPlayback: (playback) =>
        set({
            playback: playback
                ? {
                    ...playback,
                    clientSyncAtMs: Date.now(),
                }
                : null,
        }),
    setVotes: (votes) => set({ votes }),
    updateVote: (type, delta) =>
        set((s) => ({
            votes: {
                ...s.votes,
                [type === "woot" ? "woots" : type === "meh" ? "mehs" : "grabs"]:
                    s.votes[type === "woot" ? "woots" : type === "meh" ? "mehs" : "grabs"] + delta,
            },
        })),
    setIsInQueue: (value) => set({ isInQueue: value }),
    setErrorMessage: (message) => set({ errorMessage: message }),
    setPlayerVolume: (value) => {
        const nextVolume = Math.min(100, Math.max(0, value));
        if (typeof window !== "undefined") {
            window.localStorage.setItem("nicedj:player-volume", String(nextVolume));
        }
        set({ playerVolume: nextVolume });
    },
    markWootBurst: (userId) =>
        set((s) => ({
            wootBursts: {
                ...s.wootBursts,
                [userId]: Number.POSITIVE_INFINITY,
            },
        })),
    clearWootBurst: (userId) =>
        set((s) => {
            const next: Record<string, number> = {};
            for (const [currentUserId, expiresAt] of Object.entries(s.wootBursts)) {
                if (currentUserId !== userId) {
                    next[currentUserId] = expiresAt;
                }
            }
            return { wootBursts: next };
        }),
    setWootBursts: (userIds) =>
        set({
            wootBursts: Object.fromEntries(userIds.map((userId) => [userId, Number.POSITIVE_INFINITY])),
        }),
    reset: () =>
        set((state) => ({
            ...initialState,
            activeRoom: state.activeRoom,
            playerVolume: state.playerVolume,
        })),
}));
