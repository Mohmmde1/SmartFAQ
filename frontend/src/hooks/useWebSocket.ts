import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'


export function useWebSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'loading') return;

        const accessToken = session?.accessToken;
        if (!accessToken) {
            setError('No authentication token found')
            return
        }
        const baseUrl = "ws://localhost:8000/ws/faq/"
        const ws = new WebSocket(`${baseUrl}?token=${accessToken}`)

        ws.onopen = () => {
            setIsConnected(true)
            setError(null)
        }

        ws.onclose = () => {
            setIsConnected(false)
        }

        ws.onerror = (event) => {
            setError('WebSocket error occurred')
            setIsConnected(false)
        }

        setSocket(ws)

        return () => {
            ws.close()
        }
    }, [session, status])

    const sendMessage = useCallback((data: any) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data))
            return true
        }
        return false
    }, [socket])

    return { socket, isConnected, error, sendMessage }
}
