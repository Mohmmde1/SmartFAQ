import { useState, useEffect, useCallback } from 'react'


export function useWebSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/faq/")

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
    }, [])

    const sendMessage = useCallback((data: any) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data))
            return true
        }
        return false
    }, [socket])

    return { socket, isConnected, error, sendMessage }
}
