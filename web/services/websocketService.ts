import { useState, useEffect, useRef, useCallback } from 'react';

export interface QuizSessionData {
  sessionId: string;
  quizId: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  players: Player[];
  currentQuestion: Question | null;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady?: boolean;
}

export interface Question {
  id: number;
  content: string;
  type: 'mcq' | 'tf' | 'short_answer';
  options?: string[];
  points: number;
}

export interface AnswerSubmission {
  sessionId: string;
  userId: string;
  questionId: number;
  answer: string;
}

// Define event types for better type safety
export type WebSocketEventType = 
  | 'join_quiz'
  | 'submit_answer'
  | 'start_quiz'
  | 'next_question'
  | 'leave_quiz'
  | 'quiz_started'
  | 'quiz_finished'
  | 'participant_joined'
  | 'participant_left'
  | 'answer_submitted'
  | 'scores_update'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
}

// WebSocket manager class
class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private eventHandlers: Map<WebSocketEventType, Array<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;

  constructor() {
    // Use environment variable or default to localhost
    const backendUrl = process.env.REACT_APP_BACKEND_WS_URL || 'ws://localhost:3001';
    this.url = `${backendUrl}`;
  }

  public connect(): Promise<void> {
    if (this.isConnecting || this.isConnected()) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0; // Reset attempts on successful connection
          this.isConnecting = false;
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          
          // Attempt to reconnect if not closed intentionally
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectInterval);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.payload));
    }
  }

  public subscribe(eventType: WebSocketEventType, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(handler);
  }

  public unsubscribe(eventType: WebSocketEventType, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public sendMessage(type: WebSocketEventType, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
      // Optionally, queue the message for when connection is restored
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Specific methods for quiz functionality
  public joinQuiz(sessionId: string, userId: string, userName: string): void {
    this.sendMessage('join_quiz', { sessionId, userId, userName });
  }

  public submitAnswer(submission: AnswerSubmission): void {
    this.sendMessage('submit_answer', submission);
  }

  public startQuiz(sessionId: string): void {
    this.sendMessage('start_quiz', { sessionId });
  }

  public nextQuestion(sessionId: string): void {
    this.sendMessage('next_question', { sessionId });
  }

  public leaveQuiz(sessionId: string, userId: string): void {
    this.sendMessage('leave_quiz', { sessionId, userId });
  }
}

// React hook for using WebSocket in components
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const webSocketManager = useRef<WebSocketManager>(new WebSocketManager());

  useEffect(() => {
    const handleOpen = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleError = (error: Event) => {
      setIsConnected(false);
      setConnectionError('Failed to connect to server');
    };

    const handleClose = (event: CloseEvent) => {
      if (event.code !== 1000) { // Not a normal close
        setIsConnected(false);
      }
    };

    // Connect to WebSocket
    webSocketManager.current.connect()
      .then(handleOpen)
      .catch(handleError);

    return () => {
      webSocketManager.current.disconnect();
    };
  }, []);

  // Memoize the manager instance to prevent unnecessary re-renders
  const manager = useCallback(() => webSocketManager.current, []);

  return {
    webSocketManager: manager(),
    isConnected,
    connectionError
  };
};

export default WebSocketManager;