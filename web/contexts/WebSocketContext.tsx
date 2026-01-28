import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    sendMessage: (type: string, payload: any) => void;
    lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const { user } = useAuth();

    // Ref to keep track of the socket instance without triggering re-renders
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Only connect if user is logged in
        // if (!user) return; 

        // For now, allow connection even if not logged in, or handle auth inside join
        // But typically we want a persistent connection.

        // Connect to WebSocket server
        // Assuming backend is on port 3001
        const wsUrl = 'ws://localhost:3001';

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setSocket(ws);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            setSocket(null);
            // Implement reconnection logic here if needed
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('WebSocket message received:', message);
                setLastMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [user]); // Re-connect if user changes (optional)

    const sendMessage = (type: string, payload: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    };

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, sendMessage, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};
