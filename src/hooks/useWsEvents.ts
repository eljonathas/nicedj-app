import { useEffect } from "react";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { useEconomyStore } from "../stores/economyStore";
import { useRoomStore } from "../stores/roomStore";
import type { WsClient } from "../lib/ws";

export function useWsEvents(wsClient: WsClient | null) {
  const {
    addUser,
    removeUser,
    setUsers,
    setPlayback,
    setVotes,
    setQueue,
    setRoom,
    markWootBurst,
    clearWootBurst,
    setWootBursts,
    setIsInQueue,
    setErrorMessage,
  } =
    useRoomStore.getState();
  const { addMessage, clearMessages } = useChatStore.getState();

  useEffect(() => {
    if (!wsClient) return;

    const syncQueue = (queue: string[]) => {
      setQueue(queue);
      const userId = useAuthStore.getState().user?.id;
      setIsInQueue(Boolean(userId && queue.includes(userId)));
    };

    const unsubs: Array<() => void> = [];

    unsubs.push(
      wsClient.on("room_state_snapshot", (payload: any) => {
        const currentRoom = useRoomStore.getState().room;

        setRoom({
          id: payload.roomId ?? currentRoom?.id ?? "",
          name: payload.roomName ?? currentRoom?.name ?? "Sala",
          slug: payload.roomSlug ?? currentRoom?.slug ?? "",
          description: payload.roomDescription ?? currentRoom?.description ?? "",
          ownerId: currentRoom?.ownerId ?? "",
          ownerUsername: currentRoom?.ownerUsername ?? "host",
          queueLocked: payload.queueLocked ?? currentRoom?.queueLocked ?? false,
        });

        setUsers(payload.users || []);
        syncQueue(payload.queue || []);
        setPlayback(payload.playback ?? null);
        setVotes(payload.votes ?? { woots: 0, mehs: 0, grabs: 0, wootUserIds: [] });
        setWootBursts(payload.votes?.wootUserIds ?? []);
      })
    );

    unsubs.push(
      wsClient.on("user_joined", (payload: any) => {
        addUser({
          id: payload.userId,
          username: payload.username,
          avatar: payload.avatar ?? null,
          role: payload.role ?? "user",
          platformRole: payload.platformRole ?? "none",
        });
      })
    );

    unsubs.push(
      wsClient.on("user_left", (payload: any) => {
        removeUser(payload.userId);
      })
    );

    unsubs.push(
      wsClient.on("message_created", (payload: any) => {
        addMessage({
          roomId: payload.roomId,
          id: payload.id,
          userId: payload.userId,
          username: payload.username,
          avatar: payload.avatar ?? null,
          role: payload.role ?? "user",
          platformRole: payload.platformRole ?? "none",
          content: payload.content,
          timestamp: payload.timestamp,
          system: Boolean(payload.system),
        });
      })
    );

    unsubs.push(wsClient.on("chat_cleared", () => clearMessages()));

    unsubs.push(
      wsClient.on("error", (payload: any) => {
        if (!payload?.message) return;

        setErrorMessage(payload.message);
        window.setTimeout(() => {
          if (useRoomStore.getState().errorMessage === payload.message) {
            useRoomStore.getState().setErrorMessage(null);
          }
        }, 4200);
      })
    );

    unsubs.push(
      wsClient.on("playback_sync", (payload: any) => {
        setPlayback(payload ?? null);
      })
    );

    unsubs.push(
      wsClient.on("track_started", (payload: any) => {
        setPlayback(payload ?? null);
      })
    );

    unsubs.push(
      wsClient.on("votes_snapshot", (payload: any) => {
        setVotes(payload);
        setWootBursts(payload?.wootUserIds ?? []);
      })
    );

    unsubs.push(
      wsClient.on("vote_updated", (payload: any) => {
        if (payload.type === "woot" && typeof payload.userId === "string") {
          markWootBurst(payload.userId);
          return;
        }

        if (typeof payload.userId === "string") {
          clearWootBurst(payload.userId);
        }
      })
    );

    unsubs.push(
      wsClient.on("queue_joined", (payload: any) => {
        const queue = useRoomStore.getState().queue;
        syncQueue(payload.queue ?? [...queue, payload.userId]);
      })
    );

    unsubs.push(
      wsClient.on("queue_left", (payload: any) => {
        const queue = useRoomStore.getState().queue;
        syncQueue(payload.queue ?? queue.filter((id) => id !== payload.userId));
      })
    );

    unsubs.push(
      wsClient.on("queue_reordered", (payload: any) => {
        if (Array.isArray(payload.queue)) {
          syncQueue(payload.queue);
        }
      })
    );

    unsubs.push(
      wsClient.on("user_muted", (payload: any) => {
        if (payload?.userId !== useAuthStore.getState().user?.id) return;

        setErrorMessage("Voce foi silenciado no chat desta sala.");
      })
    );

    unsubs.push(
      wsClient.on("user_kicked", (payload: any) => {
        if (payload?.userId !== useAuthStore.getState().user?.id) return;

        useAuthStore.getState().wsClient?.send("leave_room");
        setIsInQueue(false);
        setPlayback(null);
        setQueue([]);
        setUsers([]);
        setErrorMessage("Voce foi expulso desta sala.");
      })
    );

    unsubs.push(
      wsClient.on("user_banned", (payload: any) => {
        if (payload?.userId !== useAuthStore.getState().user?.id) return;

        useAuthStore.getState().wsClient?.send("leave_room");
        setIsInQueue(false);
        setPlayback(null);
        setQueue([]);
        setUsers([]);
        setErrorMessage("Voce foi banido desta sala.");
      })
    );

    unsubs.push(
      wsClient.on("dj_changed", (payload: any) => {
        if (payload.queue) syncQueue(payload.queue);
      })
    );

    unsubs.push(
      wsClient.on("xp_updated", (payload: any) => {
        if (
          typeof payload?.level === "number" &&
          typeof payload?.xp === "number"
        ) {
          useAuthStore.getState().applyProgression({
            level: payload.level,
            xp: payload.xp,
          });
        }
      })
    );

    unsubs.push(
      wsClient.on("level_up", (payload: any) => {
        if (
          typeof payload?.level === "number" &&
          typeof payload?.xp === "number"
        ) {
          useAuthStore.getState().applyProgression({
            level: payload.level,
            xp: payload.xp,
          });
        }
      })
    );

    unsubs.push(
      wsClient.on("wallet_updated", (payload: any) => {
        if (
          typeof payload?.coins === "number" &&
          typeof payload?.diamonds === "number"
        ) {
          useEconomyStore.getState().applyWalletUpdate({
            coins: payload.coins,
            diamonds: payload.diamonds,
          });
        }
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [wsClient]);
}
