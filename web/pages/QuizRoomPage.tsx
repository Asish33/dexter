import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: number;
    content: string;
    options: string[];
    points: number;
}

const QuizRoomPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { sendMessage, lastMessage, isConnected } = useWebSocket();
    const { user } = useAuth();

    const [status, setStatus] = useState<'waiting' | 'playing' | 'feedback' | 'finished'>('waiting');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; explanation?: string } | null>(null);
    const [participantCount, setParticipantCount] = useState(0);

    const [leaderboard, setLeaderboard] = useState<{ userId: string; score: number }[]>([]);

    const location = useLocation();
    const [isHost, setIsHost] = useState(location.state?.isHost || false);

    const startQuiz = () => {
        sendMessage('start_quiz', { sessionId });
    };

    const nextQuestion = () => {
        sendMessage('next_question', { sessionId });
    };

    useEffect(() => {
        if (isConnected && sessionId && user) {
            // Check if we need to join (e.g. if we are Host coming from creation, or refresh)
            // Just always send join_quiz to be safe, backend handles idempotency? 
            // Better: only if not joined? But how to track?
            // Simple approach: Send join on connect.
            sendMessage('join_quiz', { sessionId, userId: user.id.toString() });
        }
    }, [isConnected, sessionId, user]);

    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'joined_quiz') {
                setParticipantCount(lastMessage.payload.participantCount);
                if (lastMessage.payload.isHost !== undefined) {
                    setIsHost(lastMessage.payload.isHost);
                }

                // If existing question provided (late join) or just waiting
                if (lastMessage.payload.currentQuestion) {
                    setStatus('playing');
                    setCurrentQuestion(lastMessage.payload.currentQuestion);
                    // Also need to set index if provided?
                    if (lastMessage.payload.currentQuestionIndex !== undefined) {
                        setQuestionIndex(lastMessage.payload.currentQuestionIndex);
                    }
                } else {
                    setStatus('waiting');
                }
            }
            else if (lastMessage.type === 'participant_joined') {
                setParticipantCount(lastMessage.payload.participantCount);
            }
            else if (lastMessage.type === 'quiz_started') {
                setStatus('playing');
                setTotalQuestions(lastMessage.payload.totalQuestions);
            }
            else if (lastMessage.type === 'next_question') {
                setStatus('playing');
                setCurrentQuestion(lastMessage.payload.question);
                setQuestionIndex(lastMessage.payload.currentQuestionIndex);
                setSelectedOption(null);
                setFeedback(null);
            }
            else if (lastMessage.type === 'answer_submitted') {
                setStatus('feedback');
                setFeedback({
                    isCorrect: lastMessage.payload.isCorrect,
                    message: lastMessage.payload.message,
                    explanation: lastMessage.payload.explanation
                });
                setScore(lastMessage.payload.newScore);
            }
            else if (lastMessage.type === 'quiz_finished') {
                setStatus('finished');
            }
            else if (lastMessage.type === 'scores_update') {
                setLeaderboard(lastMessage.payload.scores);
            }
        }
    }, [lastMessage]);

    const submitAnswer = () => {
        if (!selectedOption || !currentQuestion || !user) return;

        sendMessage('submit_answer', {
            sessionId,
            userId: user.id.toString(),
            questionId: currentQuestion.id,
            answer: selectedOption
        });
    };

    if (!sessionId) return <div>Invalid Session</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-foreground flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex justify-between items-center">
                <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Room Code</span>
                    <p className="text-lg font-bold font-mono text-primary">{sessionId}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Score</div>
                        <div className="font-bold text-xl">{score}</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium">
                        {participantCount} Players
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">


                    {/* Waiting State */}
                    {status === 'waiting' && (
                        <div className="text-center py-20">
                            <div className="animate-bounce mb-8 text-6xl">⏳</div>
                            <h2 className="text-3xl font-bold mb-4 font-heading">{isHost ? "You are the Host!" : "Waiting for host to start..."}</h2>
                            <p className="text-muted-foreground text-lg mb-8">{isHost ? "Wait for players to join, then start the quiz." : "You are joined! Sit tight."}</p>

                            {isHost && (
                                <Button
                                    size="lg"
                                    className="px-8 py-4 text-lg rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                    onClick={startQuiz}
                                >
                                    Start Quiz Now 🚀
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Playing State */}
                    {(status === 'playing' || status === 'feedback') && currentQuestion && (
                        <div className="space-y-8">
                            {/* Question */}
                            <div className="bg-white dark:bg-white/5 p-8 rounded-3xl shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5 text-center">
                                <h2 className="text-2xl md:text-3xl font-bold font-heading leading-tight">{currentQuestion.content}</h2>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => !isHost && status === 'playing' && setSelectedOption(option)}
                                        disabled={isHost || status !== 'playing'}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden group",
                                            selectedOption === option
                                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 shadow-sm",
                                            status === 'feedback' && option === selectedOption
                                                ? (feedback?.isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")
                                                : ""
                                        )}
                                    >
                                        <span className={cn(
                                            "text-lg font-medium",
                                            selectedOption === option ? "text-primary dark:text-white" : "text-gray-900 dark:text-gray-100"
                                        )}>
                                            {option}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            {status === 'playing' && !isHost && (
                                <div className="flex justify-center mt-8">
                                    <Button
                                        size="lg"
                                        className="px-12 py-6 text-xl rounded-2xl shadow-xl shadow-primary/20"
                                        disabled={!selectedOption}
                                        onClick={submitAnswer}
                                    >
                                        Submit Answer
                                    </Button>
                                </div>
                            )}

                            {/* Host View - Playing State */}
                            {status === 'playing' && isHost && (
                                <div className="text-center mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                                    <div className="animate-pulse flex flex-col items-center gap-2">
                                        <span className="text-4xl">👀</span>
                                        <h3 className="text-xl font-bold">Spectating Mode</h3>
                                        <p className="text-muted-foreground">Wait for players to answer...</p>
                                    </div>

                                    {/* Live Host Leaderboard */}
                                    {leaderboard.length > 0 && (
                                        <div className="bg-black/20 p-4 rounded-xl max-w-sm mx-auto">
                                            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Live Scores</h4>
                                            <div className="space-y-2">
                                                {leaderboard
                                                    .sort((a, b) => b.score - a.score)
                                                    .slice(0, 5)
                                                    .map((entry, idx) => (
                                                        <div key={entry.userId} className="flex justify-between items-center p-2 rounded bg-white/5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold w-5 text-sm">{idx + 1}</span>
                                                                <span className="text-sm">Player {entry.userId.slice(0, 4)}</span>
                                                            </div>
                                                            <span className="font-bold text-sm">{entry.score}</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Host Controls */}
                                    <div className="pt-4 border-t border-white/10">
                                        <Button
                                            onClick={nextQuestion}
                                            className="w-full md:w-auto px-8 py-3 rounded-xl shadow-lg bg-white text-black hover:bg-gray-200"
                                        >
                                            Next Question →
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Overlay/Message */}
                            {status === 'feedback' && feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "text-center p-6 rounded-2xl border mb-8",
                                        feedback.isCorrect
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                    )}
                                >
                                    <h3 className={cn(
                                        "text-2xl font-bold mb-2",
                                        feedback.isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                                    )}>
                                        {feedback.isCorrect ? "Correct!" : "Incorrect"}
                                    </h3>
                                    <p className="text-foreground/80">{feedback.message}</p>
                                    {feedback.explanation && (
                                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-1">Explanation</p>
                                            <p className="text-sm">{feedback.explanation}</p>
                                        </div>
                                    )}

                                    {/* Leaderboard */}
                                    {leaderboard.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="font-bold text-lg mb-4">Live Leaderboard</h4>
                                            <div className="space-y-2 max-w-sm mx-auto">
                                                {leaderboard
                                                    .sort((a, b) => b.score - a.score)
                                                    .slice(0, 5)
                                                    .map((entry, idx) => (
                                                        <div key={entry.userId} className="flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold w-6">{idx + 1}</span>
                                                                <span>Player {entry.userId.slice(0, 4)}</span>
                                                            </div>
                                                            <span className="font-bold">{entry.score}</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        {isHost ? (
                                            <Button
                                                onClick={nextQuestion}
                                                className="w-full md:w-auto px-8 py-3 rounded-xl shadow-lg"
                                            >
                                                Next Question →
                                            </Button>
                                        ) : (
                                            <p className="text-sm animate-pulse text-muted-foreground">Waiting for host to next question...</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Finished State */}
                    {status === 'finished' && (
                        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 p-10">
                            <div className="text-6xl mb-6">🏆</div>
                            <h2 className="text-4xl font-bold mb-4 font-heading">Quiz Completed!</h2>
                            <p className="text-2xl text-primary font-bold mb-8">Final Score: {score}</p>
                            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default QuizRoomPage;
