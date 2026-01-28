import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { Logo } from '../components/Logo';

const JoinQuizPage = () => {
    const [sessionId, setSessionId] = useState('');
    const [error, setError] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const navigate = useNavigate();
    const { sendMessage, lastMessage, isConnected } = useWebSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'joined_quiz') {
                setIsJoining(false);
                navigate(`/dashboard/quiz/${lastMessage.payload.sessionId}`);
            } else if (lastMessage.type === 'error') {
                setIsJoining(false);
                setError(lastMessage.payload.message || 'Failed to join quiz');
            }
        }
    }, [lastMessage, navigate]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!sessionId.trim()) {
            setError('Please enter a valid Room Code');
            return;
        }

        if (!isConnected) {
            setError('Connection lost. Reconnecting...');
            return;
        }

        if (!user) {
            setError('You must be logged in to join a quiz.');
            return;
        }

        setIsJoining(true);
        sendMessage('join_quiz', {
            sessionId: sessionId.trim(),
            userId: user.id.toString(), // Ensure userId is sent as string if backend expects string
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4">
            <div className="w-full max-w-md bg-white dark:bg-white/5 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-white/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        <Logo className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground font-heading">Join a Quiz</h1>
                    <p className="text-sm text-muted-foreground mt-2">Enter the room code to start playing.</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="text"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            placeholder="Enter Room Code (e.g., quiz_1_1_abc)"
                            className="w-full text-center text-lg tracking-widest bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        type="submit"
                        disabled={isJoining || !isConnected}
                        className="rounded-xl py-6 text-lg"
                    >
                        {isJoining ? 'Joining...' : 'Join Quiz'}
                    </Button>

                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Start your own quiz instead
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinQuizPage;
