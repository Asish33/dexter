import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: number;
    content: string;
    options: Option[];
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

    useEffect(() => {
        // Demo Mode Check
        if (sessionId === 'demo') {
            setStatus('playing');
            setCurrentQuestion({
                id: 1,
                content: "What is the capital of France?",
                options: [
                    { id: 'a', text: "London" },
                    { id: 'b', text: "Berlin" },
                    { id: 'c', text: "Paris" },
                    { id: 'd', text: "Madrid" }
                ],
                points: 10
            });
            setTotalQuestions(5);
            setParticipantCount(3);
            return;
        }

        // Check if connected, if not, maybe redirect to join? or wait
        if (!isConnected) {
            // console.log("Waiting for connection...");
        }
    }, [isConnected, sessionId]);

    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'joined_quiz') {
                // Should be already joined if we got here from JoinPage, 
                // but if user refreshed, we might need to rejoin or checking state
                // For now assume JoinPage handles the initial join
                setStatus('waiting');
                setParticipantCount(lastMessage.payload.participantCount);
            }
            else if (lastMessage.type === 'participant_joined') {
                setParticipantCount(lastMessage.payload.participantCount);
            }
            else if (lastMessage.type === 'quiz_started') {
                setStatus('playing');
                setTotalQuestions(lastMessage.payload.totalQuestions);
                // Maybe the first question comes in 'next_question' separately? 
                // Or we might need to wait for it.
                // Backend broadcast 'quiz_started', usually followed by 'next_question' logic from host?
                // Or does start_quiz auto-trigger first question?
                // Checking backend: startQuiz broadcasts 'quiz_started'. 
                // Host needs to trigger 'next_question'. 
                // Wait, if I am a player, I wait for next_question.
            }
            else if (lastMessage.type === 'next_question') {
                setStatus('playing');
                setCurrentQuestion(lastMessage.payload.question);
                setQuestionIndex(lastMessage.payload.currentQuestionIndex);
                setSelectedOption(null);
                setFeedback(null);
            }
            else if (lastMessage.type === 'answer_submitted') {
                // This is my own answer result
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
                // Could update leaderboard here
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
                            <h2 className="text-3xl font-bold mb-4 font-heading">Waiting for host to start...</h2>
                            <p className="text-muted-foreground text-lg">You are joined! Sit tight.</p>
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
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => status === 'playing' && setSelectedOption(option.text)}
                                        disabled={status !== 'playing'}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden group",
                                            selectedOption === option.text
                                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "border-transparent bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm",
                                            status === 'feedback' && option.text === selectedOption
                                                ? (feedback?.isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")
                                                : ""
                                        )}
                                    >
                                        <span className={cn(
                                            "text-lg font-medium",
                                            selectedOption === option.text ? "text-primary dark:text-white" : "text-foreground"
                                        )}>
                                            {option.text}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            {status === 'playing' && (
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
                                    <div className="mt-6">
                                        <p className="text-sm animate-pulse text-muted-foreground">Waiting for host to next question...</p>
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
