import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../services/websocketService';
import { toast } from 'sonner';

interface Question {
  id: number;
  content: string;
  type: 'mcq' | 'tf' | 'short_answer';
  options?: string[];
  points: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

const MultiplayerQuizGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { webSocketManager, isConnected } = useWebSocket();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    // Generate a random user ID for this session
    const generatedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(generatedUserId);

    // Join the quiz session
    webSocketManager.joinQuiz(sessionId, generatedUserId, 'Current User');

    // Subscribe to game events
    const handleQuizStarted = (payload: any) => {
      // Quiz has started, initialize the game
      setTotalQuestions(payload.totalQuestions || 10);
      setIsLoading(false);
    };

    const handleNextQuestion = (payload: any) => {
      // Update to the next question
      setCurrentQuestionIndex(payload.currentQuestionIndex);
      setCurrentQuestion(payload.question);
      setTimeLeft(30); // Reset timer
      setIsAnswerSubmitted(false);
      setSelectedAnswer(null);
    };

    const handleScoresUpdate = (payload: any) => {
      // Update leaderboard with new scores
      setLeaderboard(payload.scores.map((s: any) => ({
        id: s.userId,
        name: s.userId === userId ? 'You' : `Player ${s.userId}`,
        score: s.score
      })));
    };

    const handleAnswerSubmitted = (payload: any) => {
      // Handle response after submitting an answer
      setIsAnswerSubmitted(true);

      // Show feedback for a few seconds
      setTimeout(() => {
        setIsAnswerSubmitted(false);
      }, 2000);
    };

    const handleQuizFinished = (payload: any) => {
      // Quiz has finished, redirect to results
      navigate(`/quiz/${sessionId}/results`);
    };

    const handleError = (payload: any) => {
      console.error('WebSocket error:', payload.message);
      toast.error(payload.message || 'An error occurred during the quiz');
    };

    webSocketManager.subscribe('quiz_started', handleQuizStarted);
    webSocketManager.subscribe('next_question', handleNextQuestion);
    webSocketManager.subscribe('scores_update', handleScoresUpdate);
    webSocketManager.subscribe('answer_submitted', handleAnswerSubmitted);
    webSocketManager.subscribe('quiz_finished', handleQuizFinished);
    webSocketManager.subscribe('error', handleError);

    // Cleanup
    return () => {
      webSocketManager.unsubscribe('quiz_started', handleQuizStarted);
      webSocketManager.unsubscribe('next_question', handleNextQuestion);
      webSocketManager.unsubscribe('scores_update', handleScoresUpdate);
      webSocketManager.unsubscribe('answer_submitted', handleAnswerSubmitted);
      webSocketManager.unsubscribe('quiz_finished', handleQuizFinished);
      webSocketManager.unsubscribe('error', handleError);
      webSocketManager.leaveQuiz(sessionId, generatedUserId);
    };
  }, [sessionId, navigate, webSocketManager, userId]);

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && !isAnswerSubmitted) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !isAnswerSubmitted) {
      handleSubmitAnswer(null); // Auto-submit if time runs out
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isAnswerSubmitted]);

  const handleSelectAnswer = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = (answer: string | null) => {
    if (isAnswerSubmitted || !sessionId || !currentQuestion || !userId) return;

    // Submit answer via WebSocket
    webSocketManager.submitAnswer({
      sessionId,
      userId,
      questionId: currentQuestion.id,
      answer: answer || ''
    });

    setIsAnswerSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Top bar with timer, question counter, and leaderboard toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-foreground">
            Question <span className="font-bold">{currentQuestionIndex + 1}</span> of {totalQuestions}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
              {timeLeft}s
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <span className="text-sm capitalize">{connectionStatus}</span>
            </div>
          </div>
          <div className="text-foreground">
            Points: <span className="font-bold">{currentQuestion?.points || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main quiz area */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6">
              {currentQuestion && (
                <>
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {currentQuestion.content}
                  </h2>

                  {currentQuestion.type === 'mcq' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAnswer(option)}
                          disabled={isAnswerSubmitted}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${selectedAnswer === option
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                            } ${isAnswerSubmitted ? 'opacity-75 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'
                            }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${selectedAnswer === option
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border'
                              }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'tf' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSelectAnswer('True')}
                        disabled={isAnswerSubmitted}
                        className={`p-4 rounded-lg border transition-all ${selectedAnswer === 'True'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                          } ${isAnswerSubmitted ? 'opacity-75 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'
                          }`}
                      >
                        True
                      </button>
                      <button
                        onClick={() => handleSelectAnswer('False')}
                        disabled={isAnswerSubmitted}
                        className={`p-4 rounded-lg border transition-all ${selectedAnswer === 'False'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                          } ${isAnswerSubmitted ? 'opacity-75 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'
                          }`}
                      >
                        False
                      </button>
                    </div>
                  )}

                  {currentQuestion.type === 'short_answer' && (
                    <div className="space-y-3">
                      <textarea
                        value={selectedAnswer || ''}
                        onChange={(e) => !isAnswerSubmitted && setSelectedAnswer(e.target.value)}
                        disabled={isAnswerSubmitted}
                        placeholder="Type your answer here..."
                        className="w-full p-4 rounded-lg border border-border bg-background focus:border-primary focus:outline-none min-h-[120px]"
                      />
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleSubmitAnswer(selectedAnswer)}
                      disabled={!selectedAnswer || isAnswerSubmitted}
                      className={`px-6 py-3 rounded-lg font-medium ${selectedAnswer && !isAnswerSubmitted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                    >
                      {isAnswerSubmitted ? 'Submitted!' : 'Submit Answer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Leaderboard sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Leaderboard</h3>

              <div className="space-y-3">
                {leaderboard
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${index === 0
                        ? 'bg-yellow-500/10 border border-yellow-500/20'
                        : 'bg-muted/30'
                        } ${player.name === 'You' ? 'ring-2 ring-primary/30 rounded-lg' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${index === 0 ? 'bg-yellow-500 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                            index === 2 ? 'bg-amber-800 text-amber-100' :
                              'bg-muted text-muted-foreground'
                          }`}>
                          {index + 1}
                        </div>
                        <span className={`font-medium ${player.name === 'You' ? 'text-primary' : 'text-foreground'}`}>
                          {player.name} {player.name === 'You' && '(You)'}
                        </span>
                      </div>
                      <div className="font-bold text-foreground">
                        {player.score}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Answer feedback overlay (shown after submission) */}
        {isAnswerSubmitted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Checking Answer</h3>
              <p className="text-muted-foreground mb-4">
                Waiting for other players to answer...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerQuizGame;