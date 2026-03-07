import { create } from "zustand";
import { api } from "../lib/api";
import { useAuthStore } from "./authStore";
import { useRoomStore } from "./roomStore";

export interface AvatarStoreItem {
    id: string;
    name: string;
    collection: string;
    type: "free" | "level" | "premium";
    status: string;
    unlockLevel: number | null;
    price: number;
    currency: "free" | "coins" | "diamonds";
    url: string;
    frameWidth: number;
    frameCount: number;
}

export interface AvatarStoreSection {
    id: "free" | "level" | "premium";
    label: string;
    marker: string;
    items: AvatarStoreItem[];
}

interface WalletPayload {
    coins: number;
    diamonds: number;
}

interface InventoryPayload {
    ownedAvatarIds: string[];
    equippedAvatarId: string | null;
}

interface EconomyState {
    coins: number;
    diamonds: number;
    sections: AvatarStoreSection[];
    ownedAvatarIds: string[];
    equippedAvatarId: string | null;
    loading: boolean;

    fetchWallet: () => Promise<void>;
    fetchStore: () => Promise<void>;
    fetchInventory: () => Promise<void>;
    purchase: (itemId: string) => Promise<boolean>;
    equip: (itemId: string) => Promise<boolean>;
    applyWalletUpdate: (wallet: WalletPayload) => void;
}

export const useEconomyStore = create<EconomyState>((set) => ({
    coins: 0,
    diamonds: 0,
    sections: [],
    ownedAvatarIds: [],
    equippedAvatarId: null,
    loading: false,

    fetchWallet: async () => {
        const data = await api<WalletPayload>("/api/wallet");
        set({ coins: data.coins, diamonds: data.diamonds });
    },

    fetchStore: async () => {
        set({ loading: true });
        try {
            const data = await api<{ sections: AvatarStoreSection[] }>("/api/store");
            set({ sections: data.sections });
        } finally {
            set({ loading: false });
        }
    },

    fetchInventory: async () => {
        const data = await api<InventoryPayload>("/api/inventory");
        set({
            ownedAvatarIds: data.ownedAvatarIds,
            equippedAvatarId: data.equippedAvatarId,
        });
    },

    purchase: async (itemId: string) => {
        try {
            const idempotencyKey = `${itemId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const result = await api<{
                success: boolean;
                wallet: WalletPayload;
                inventory: InventoryPayload;
            }>("/api/store/purchase", {
                method: "POST",
                body: { itemId, idempotencyKey },
            });

            set({
                coins: result.wallet.coins,
                diamonds: result.wallet.diamonds,
                ownedAvatarIds: result.inventory.ownedAvatarIds,
                equippedAvatarId: result.inventory.equippedAvatarId,
            });

            return true;
        } catch {
            return false;
        }
    },

    equip: async (itemId: string) => {
        try {
            const result = await api<{
                success: boolean;
                avatarId: string;
                avatar: string;
                inventory: InventoryPayload;
            }>("/api/store/equip", {
                method: "POST",
                body: { itemId },
            });

            set({
                ownedAvatarIds: result.inventory.ownedAvatarIds,
                equippedAvatarId: result.inventory.equippedAvatarId,
            });

            useAuthStore.getState().setAvatarSelection(result.avatarId, result.avatar);
            const userId = useAuthStore.getState().user?.id;
            if (userId) {
                useRoomStore.getState().updateUserAvatar(userId, result.avatar);
            }
            return true;
        } catch {
            return false;
        }
    },

    applyWalletUpdate: (wallet) =>
        set({
            coins: wallet.coins,
            diamonds: wallet.diamonds,
        }),
}));
