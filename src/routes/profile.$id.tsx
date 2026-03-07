import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Calendar, Heart, UserPlus, Loader2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { getLevelProgress } from "../lib/progression";

export const Route = createFileRoute("/profile/$id")({
    component: ProfileRoutePage,
});

interface UserProfile {
    id: string;
    username: string;
    avatar: string | null;
    level: number;
    xp: number;
    createdAt: string;
    fanCount: number;
    badges: Array<{
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        awardedAt: string;
    }>;
}

function ProfileRoutePage() {
    const { id } = Route.useParams();
    return <ProfilePage profileId={id} />;
}

export function ProfilePage({ profileId }: { profileId: string }) {
    const me = useAuthStore((s) => s.user);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api<UserProfile>(`/api/users/${profileId}`)
            .then(setProfile)
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [profileId]);

    useEffect(() => {
        if (!me || me.id !== profileId) return;

        setProfile((current) =>
            current
                ? {
                    ...current,
                    level: me.level,
                    xp: me.xp,
                }
                : current
        );
    }, [me, profileId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-[var(--text-secondary)]">Usuário não encontrado.</p>
            </div>
        );
    }

    const isMe = me?.id === profile.id;
    const { xpIntoLevel, xpForNextLevel, progressPct } = getLevelProgress(
        profile.level,
        profile.xp,
    );

    return (
        <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {/* Hero Card */}
                <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] p-8 text-center mb-8">
                    <Avatar username={profile.username} size="lg" className="w-20 h-20 text-2xl mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">{profile.username}</h1>

                    <div className="flex items-center justify-center gap-6 mt-4 text-[13px]">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Star className="w-4 h-4 text-[var(--warning)]" />
                            <span>Nível {profile.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Heart className="w-4 h-4 text-[var(--danger)]" />
                            <span>{profile.fanCount} fãs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Calendar className="w-4 h-4" />
                            <span>Desde {new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</span>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mt-5 max-w-xs mx-auto">
                        <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                            <span>{profile.xp} XP</span>
                            <span>{xpIntoLevel}/{xpForNextLevel} XP</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full rounded-full bg-[var(--accent)]"
                            />
                        </div>
                    </div>

                    {!isMe && me && (
                        <div className="flex justify-center gap-3 mt-6">
                            <Button size="sm">
                                <Heart className="w-3.5 h-3.5 mr-1.5" />
                                Seguir
                            </Button>
                            <Button size="sm" variant="ghost">
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                Adicionar
                            </Button>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[var(--accent)]" />
                        Badges
                    </h2>
                    {profile.badges.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {profile.badges.map((badge, i) => (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] p-4 flex flex-col items-center text-center"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-2 overflow-hidden">
                                        {badge.imageUrl ? (
                                            <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Award className="w-6 h-6 text-[var(--accent)]" />
                                        )}
                                    </div>
                                    <p className="text-[13px] font-semibold text-white">{badge.name}</p>
                                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{badge.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                            <Award className="w-10 h-10 mx-auto mb-2 text-[var(--text-muted)] opacity-30" />
                            <p className="text-[14px] text-[var(--text-muted)]">Nenhuma badge conquistada</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
