import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [websocketError, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();

    // Store WebSocket instance persistently
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (status === "loading") return;

        const accessToken = session?.accessToken;
        if (!accessToken) {
            setError("No authentication token found");
            return;
        }

        const url = `${process.env.NEXT_PUBLIC_BACKEND}/faq/?token=${accessToken}`;

        // Prevent reconnecting if socket is still open
        if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
            return;
        }

        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed:", event.code, event.reason);
            setIsConnected(false);
            // Do not clear socketRef here to keep the connection reference
        };

        ws.onerror = (event) => {
            console.error("WebSocket error:", event);
            setError("WebSocket error occurred");
        };

        return () => {
            // Do not close the WebSocket on cleanup to maintain connection
            if(status !== "authenticated"){
                ws.close();
            }
            // ws.close();  <-- REMOVE THIS LINE to keep connection alive
        };
    }, [session, status]);

    // Handle page visibility changes (keep connection alive)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                if (socketRef.current && socketRef.current.readyState === WebSocket.CLOSED) {
                    console.log("Reusing existing WebSocket connection.");
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    const sendMessage = useCallback((data: Record<string, unknown>) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
            return true;
        }
        return false;
    }, []);

    return { socket: socketRef.current, isConnected, websocketError, sendMessage };
}
