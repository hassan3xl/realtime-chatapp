"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "./AuthContext";

const WS_BASE = "ws://localhost:8000/ws/chat/";

export interface WsNewMessage {
  type: "new_message";
  data: {
    id: number;
    thread_id: number;
    user: {
      id: number;
      username: string;
      display_name: string;
      is_bot: boolean;
    };
    message: string;
    timestamp: string;
  };
}

export interface WsUserStatus {
  type: "user_status";
  data: {
    user_id: number;
    is_online: boolean;
    last_seen: string | null;
  };
}

type WsEvent = WsNewMessage | WsUserStatus;

interface UseSocketOptions {
  onMessage?: (event: WsNewMessage) => void;
  onStatusChange?: (event: WsUserStatus) => void;
}

export function useSocket({
  onMessage,
  onStatusChange,
}: UseSocketOptions = {}) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [connected, setConnected] = useState(false);

  // Store callbacks in refs so we don't reconnect when they change
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const onStatusRef = useRef(onStatusChange);
  onStatusRef.current = onStatusChange;

  const connect = useCallback(() => {
    if (!user) return;

    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);

        if (data.type === "new_message") {
          onMessageRef.current?.(data as WsNewMessage);
        } else if (data.type === "user_status") {
          onStatusRef.current?.(data as WsUserStatus);
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("[WS] Disconnected", event.code);
      setConnected(false);
      wsRef.current = null;

      // Don't reconnect for intentional close (1000) or auth failure (4001)
      if (event.code !== 1000 && event.code !== 4001) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("[WS] Reconnecting...");
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("[WS] Error:", error);
    };
  }, [user]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendWsMessage = useCallback((threadId: number, message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          thread_id: threadId,
          message,
        }),
      );
    }
  }, []);

  return { connected, sendWsMessage };
}
