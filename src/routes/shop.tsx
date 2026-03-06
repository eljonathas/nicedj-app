import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Store, Coins, Package, Loader2, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { useEconomyStore } from "../stores/economyStore";
import { useAuthStore } from "../stores/authStore";

export const Route = createFileRoute("/shop")({
    component: ShopPage,
});

function ShopPage() {
    const user = useAuthStore((s) => s.user);
    const { balance, storeItems, inventory, loading, fetchBalance, fetchStore, fetchInventory, purchase } = useEconomyStore();
    const [tab, setTab] = useState<"store" | "inventory">("store");
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        fetchStore();
        if (user) {
            fetchBalance();
            fetchInventory();
        }
    }, [user]);

    const handlePurchase = async (itemId: string) => {
        setPurchasing(itemId);
        await purchase(itemId);
        setPurchasing(null);
    };

    const ownedIds = new Set(inventory.map((i) => i.storeItemId));

    return (
        <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {/* Header */}
                <div className="flex items-end justify-between mb-8 border-b border-[var(--border-light)] pb-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">Loja</h1>
                        <p className="text-[var(--text-secondary)] text-[15px]">Avatares e cosméticos para personalizar seu perfil.</p>
                    </div>
                    {user && (
                        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-4 py-2 rounded-xl border border-[var(--border-light)]">
                            <Coins className="w-4 h-4 text-[var(--warning)]" />
                            <span className="text-[15px] font-semibold text-white">{balance}</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex bg-[var(--bg-tertiary)] rounded-lg p-0.5 mb-8 w-fit border border-[var(--border-light)]/30">
                    <button
                        onClick={() => setTab("store")}
                        className={`flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold rounded-md transition-colors cursor-pointer border-0 ${tab === "store" ? "bg-[var(--bg-elevated)] text-white shadow-sm" : "bg-transparent text-[var(--text-muted)]"}`}
                    >
                        <Store className="w-3.5 h-3.5" />
                        Loja
                    </button>
                    <button
                        onClick={() => setTab("inventory")}
                        className={`flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold rounded-md transition-colors cursor-pointer border-0 ${tab === "inventory" ? "bg-[var(--bg-elevated)] text-white shadow-sm" : "bg-transparent text-[var(--text-muted)]"}`}
                    >
                        <Package className="w-3.5 h-3.5" />
                        Inventário
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
                    </div>
                )}

                {tab === "store" && !loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {storeItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] p-4 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] flex items-center justify-center mb-3 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
                                    )}
                                </div>
                                <p className="text-[14px] font-semibold text-white mb-0.5">{item.name}</p>
                                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">{item.type}</p>
                                <div className="flex items-center gap-1 mb-3">
                                    <Coins className="w-3.5 h-3.5 text-[var(--warning)]" />
                                    <span className="text-[14px] font-bold text-white">{item.price}</span>
                                </div>
                                {ownedIds.has(item.id) ? (
                                    <span className="text-[12px] text-[var(--success)] font-medium">Adquirido</span>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handlePurchase(item.id)}
                                        isLoading={purchasing === item.id}
                                        disabled={!user || balance < item.price}
                                    >
                                        Comprar
                                    </Button>
                                )}
                            </motion.div>
                        ))}
                        {storeItems.length === 0 && (
                            <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
                                <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-semibold text-white">Loja vazia</p>
                                <p className="text-[13px] mt-1">Nenhum item disponível no momento.</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === "inventory" && !loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {inventory.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] p-4 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] flex items-center justify-center mb-3 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
                                    )}
                                </div>
                                <p className="text-[14px] font-semibold text-white mb-0.5">{item.name}</p>
                                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">{item.type}</p>
                            </motion.div>
                        ))}
                        {inventory.length === 0 && (
                            <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
                                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-semibold text-white">Inventário vazio</p>
                                <p className="text-[13px] mt-1">Compre itens na loja para personalizar seu perfil.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
