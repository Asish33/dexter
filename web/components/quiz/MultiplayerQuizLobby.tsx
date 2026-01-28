import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../Button';
import { useWebSocket } from '../../services/websocketService';
import { toast } from 'sonner';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
}

const MultiplayerQuizLobby: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { webSocketManager, isConnected, connectionError } = useWebSocket();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session ID');
      setIsLoading(false);
      return;
    }

    // Generate a random user ID for this session
    const generatedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(generatedUserId);

    // Join the quiz session
    webSocketManager.joinQuiz(sessionId, generatedUserId, 'You');

    // Subscribe to lobby events
    const handleJoinedQuiz = (payload: any) => {
      setPlayers(payload.players || []);
      setIsLoading(false);
    };

    const handleParticipantJoined = (payload: any) => {
      setPlayers(prev => [...prev, { id: payload.userId, name: `Player ${prev.length + 1}`, isHost: false, score: 0 }]);
    };

    const handleParticipantLeft = (payload: any) => {
      setPlayers(prev => prev.filter(p => p.id !== payload.userId));
    };

    const handleError = (payload: any) => {
      const errorMessage = payload.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    };

    webSocketManager.subscribe('joined_quiz', handleJoinedQuiz);
    webSocketManager.subscribe('participant_joined', handleParticipantJoined);
    webSocketManager.subscribe('participant_left', handleParticipantLeft);
    webSocketManager.subscribe('error', handleError);

    // Cleanup
    return () => {
      webSocketManager.unsubscribe('joined_quiz', handleJoinedQuiz);
      webSocketManager.unsubscribe('participant_joined', handleParticipantJoined);
      webSocketManager.unsubscribe('participant_left', handleParticipantLeft);
      webSocketManager.unsubscribe('error', handleError);
    };
  }, [sessionId, webSocketManager]);

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  const startQuiz = () => {
    webSocketManager.startQuiz(sessionId!);
    navigate(`/quiz/${sessionId}/game`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error && !players.length) { // Only show error if no players have joined yet
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Quiz Lobby</h1>
          <div className="flex justify-center items-center mt-2">
            <p className="text-muted-foreground">Session ID: {sessionId}</p>
            <div className="ml-4 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <span className="text-sm capitalize">{connectionStatus}</span>
            </div>
          </div>
        </header>

        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Players ({players.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border ${player.isHost
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${player.isHost ? 'bg-primary' : 'bg-green-500'}`}></div>
                  <span className="font-medium text-foreground">
                    {player.name} {player.isHost && '(Host)'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Score: {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          {isHost ? (
            <Button
              onClick={startQuiz}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Start Quiz
            </Button>
          ) : (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-foreground">Waiting for host to start the quiz...</p>
              <div className="mt-2 animate-pulse">
                <div className="inline-block h-2 w-2 rounded-full bg-primary mr-1"></div>
                <div className="inline-block h-2 w-2 rounded-full bg-primary mr-1"></div>
                <div className="inline-block h-2 w-2 rounded-full bg-primary"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerQuizLobby;