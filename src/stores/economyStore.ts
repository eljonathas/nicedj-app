import { create } from "zustand";
import { api } from "../lib/api";

interface StoreItem {
    id: string;
    name: string;
    type: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
}

interface InventoryItem {
    id: string;
    storeItemId: string;
    name: string;
    type: string;
    imageUrl: string;
    equippedAt: string | null;
    purchasedAt: string;
}

interface EconomyState {
    balance: number;
    storeItems: StoreItem[];
    inventory: InventoryItem[];
    loading: boolean;

    fetchBalance: () => Promise<void>;
    fetchStore: () => Promise<void>;
    fetchInventory: () => Promise<void>;
    purchase: (itemId: string) => Promise<boolean>;
}

export const useEconomyStore = create<EconomyState>((set, get) => ({
    balance: 0,
    storeItems: [],
    inventory: [],
    loading: false,

    fetchBalance: async () => {
        const data = await api<{ balance: number }>("/api/wallet");
        set({ balance: data.balance });
    },

    fetchStore: async () => {
        set({ loading: true });
        try {
            const data = await api<StoreItem[]>("/api/store");
            set({ storeItems: data });
        } finally {
            set({ loading: false });
        }
    },

    fetchInventory: async () => {
        const data = await api<InventoryItem[]>("/api/inventory");
        set({ inventory: data });
    },

    purchase: async (itemId: string) => {
        try {
            const idempotencyKey = `${itemId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const result = await api<{ success: boolean; newBalance: number }>("/api/store/purchase", {
                method: "POST",
                body: { itemId, idempotencyKey },
            });
            set({ balance: result.newBalance });
            await get().fetchInventory();
            return true;
        } catch {
            return false;
        }
    },
}));
