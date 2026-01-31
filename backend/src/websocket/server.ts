import { WebSocketServer, WebSocket } from 'ws';
import redisClient from '../config/redis';
import { RedisQuizService } from '../services/redisQuizService';
import { db } from '../db';
import { questions, quizzes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { APIGatewayService } from '../services/apiGatewayService';

interface QuizSession {
  id: string;
  participants: WebSocket[];
  currentQuestionIndex: number;
  scores: Map<string, number>;
  startTime?: Date;
}


const activeConnections = new Map<WebSocket, string>();
const activeSessions = new Map<string, QuizSession>();

export const setupWebSocket = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Handle disconnection logic
      handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
};

const handleMessage = async (ws: WebSocket, message: any) => {
  switch (message.type) {
    case 'join_quiz':
      await joinQuizSession(ws, message.payload);
      break;
    case 'submit_answer':
      await handleAnswerSubmission(ws, message.payload);
      break;
    case 'start_quiz':
      await startQuiz(message.payload.sessionId);
      break;
    case 'next_question':
      await nextQuestion(message.payload.sessionId);
      break;
    case 'leave_quiz':
      await handleLeaveQuiz(ws, message.payload);
      break;
    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
};

const joinQuizSession = async (ws: WebSocket, payload: { sessionId: string; userId: string }) => {
  const { sessionId, userId } = payload;

  try {
    // Validate session ID format
    if (!sessionId || typeof sessionId !== 'string') {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid session ID format' }
      }));
      return;
    }

    // Add to active connections map
    activeConnections.set(ws, sessionId);

    // Check if session exists in memory
    let session = activeSessions.get(sessionId);

    if (!session) {
      // Check if session exists in Redis
      const sessionData = await RedisQuizService.getQuizSession(sessionId);

      if (sessionData) {
        // Session exists in Redis, load it to memory
        session = {
          id: sessionId,
          participants: [ws], // Will be updated as other participants connect
          currentQuestionIndex: parseInt(sessionData.currentQuestionIndex ?? '-1'),
          scores: new Map<string, number>(),
          startTime: sessionData.startTime ? new Date(sessionData.startTime) : undefined,
        };

        // Load scores from Redis
        const scores = await RedisQuizService.getAllScores(sessionId);
        scores.forEach(({ userId, score }) => {
          session!.scores.set(userId, score);
        });
      } else {
        // Session doesn't exist in Redis, this shouldn't happen in a real scenario
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Session not found' }
        }));
        return;
      }

      activeSessions.set(sessionId, session);
    } else {
      // Add to existing session in memory
      session.participants.push(ws);
    }

    // Add player to session in Redis
    await RedisQuizService.addPlayerToSession(sessionId, userId);

    // Initialize user score in memory and Redis
    session.scores.set(userId, 0);
    await RedisQuizService.updatePlayerScore(sessionId, userId, 0);

    // Update participant count in Redis
    const players = await RedisQuizService.getPlayersInSession(sessionId);
    const participantCount = players.length;
    await RedisQuizService.updateParticipantCount(sessionId, participantCount);

    // Check if user is host
    let isHost = false;
    const sessionDataForHostCheck = await RedisQuizService.getQuizSession(sessionId);
    if (sessionDataForHostCheck && sessionDataForHostCheck.quizId) {
      // We need to fetch the quiz to check ownership. import quizService or use db
      // Using db directly as we imported schema
      const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, parseInt(sessionDataForHostCheck.quizId)));
      if (quiz && quiz.userId === parseInt(userId)) {
        isHost = true;
      }
    }

    let currentQuestionPayload = null;
    if (session.currentQuestionIndex >= 0) {
      // Quiz is active, fetch current question
      const questionsStr = await redisClient.get(`quiz_questions:${sessionId}`);
      if (questionsStr) {
        const questions = JSON.parse(questionsStr);
        console.log(`[DEBUG] Session ${sessionId} active. Index: ${session.currentQuestionIndex}. Questions count: ${questions.length}`);
        const currentQuestion = questions[session.currentQuestionIndex];
        if (currentQuestion) {
          currentQuestionPayload = {
            id: currentQuestion.id,
            content: currentQuestion.content,
            type: currentQuestion.type,
            options: currentQuestion.options,
            points: currentQuestion.points
          };
        }
      } else {
        console.log(`[DEBUG] Session ${sessionId} active but NO questions in Redis!`);
      }
    } else {
      console.log(`[DEBUG] Session ${sessionId} join. Index is ${session.currentQuestionIndex} (waiting state)`);
    }

    // Send success response with initial quiz data
    const payload = {
      sessionId,
      message: 'Successfully joined quiz session',
      participantCount,
      currentQuestionIndex: session.currentQuestionIndex,
      isHost,
      currentQuestion: currentQuestionPayload
    };
    // console.log('[DEBUG] Sending joined_quiz payload:', JSON.stringify(payload, null, 2));

    ws.send(JSON.stringify({
      type: 'joined_quiz',
      payload
    }));

    // Notify other participants
    broadcastToOthers(ws, session, {
      type: 'participant_joined',
      payload: {
        userId,
        participantCount,
      }
    });
  } catch (error) {
    console.error('Error in joinQuizSession:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Failed to join quiz session' }
    }));
  }
};

const handleAnswerSubmission = async (ws: WebSocket, payload: { sessionId: string; userId: string; questionId: number; answer: string }) => {
  const { sessionId, userId, questionId, answer } = payload;

  try {
    // Get the question from the database to validate the answer
    const [questionResult] = await db.select().from(questions).where(eq(questions.id, questionId));
    if (!questionResult) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Question not found' }
      }));
      return;
    }

    const question = questionResult;

    // Evaluate the answer using the AI worker
    const evaluationResult = await APIGatewayService.evaluateAnswer(
      question.content,
      question.correctAnswer,
      answer
    );

    const isCorrect = evaluationResult.isCorrect;

    // Update the score in memory and Redis
    const session = activeSessions.get(sessionId);
    let newScore = 0;
    if (isCorrect) {
      // Award points based on the question's point value
      newScore = await RedisQuizService.incrementPlayerScore(sessionId, userId, question.points || 10);
    } else {
      // Get current score if incorrect
      newScore = await RedisQuizService.getPlayerScore(sessionId, userId);
    }

    // Update in memory
    if (session) {
      session.scores.set(userId, newScore);
    }

    // Get the attempt ID for this user in this session
    // For simplicity, we'll create a new attempt if one doesn't exist
    // In a real implementation, this would be handled differently
    const quizAttemptService = await import('../services/quizAttemptService');

    // First, check if the user has an active attempt for this quiz
    // This would require getting the quiz ID from the sessionok 
    const sessionData = await RedisQuizService.getQuizSession(sessionId);
    if (!sessionData) {
      throw new Error('Session data not found');
    }

    const quizId = parseInt(sessionData.quizId || '0');


    const userAttempts = await quizAttemptService.QuizAttemptService.getUserAttemptsForQuiz(parseInt(userId), quizId);
    let attemptId: number;

    if (userAttempts.length > 0) {

      attemptId = userAttempts[0]!.id;
    } else {
      // Create a new quiz attempt
      const questionsStr = await redisClient.get(`quiz_questions:${sessionId}`);
      const totalQuestions = questionsStr ? JSON.parse(questionsStr).length : 0;
      const newAttempt = await quizAttemptService.QuizAttemptService.createQuizAttempt(quizId, parseInt(userId), totalQuestions * 10);
      attemptId = newAttempt.id;
    }

    await quizAttemptService.QuizAttemptService.submitAnswer(
      { attemptId, questionId, content: answer },
      question.content,
      question.correctAnswer
    );

    // Send acknowledgment back to the user who submitted the answer
    ws.send(JSON.stringify({
      type: 'answer_submitted',
      payload: {
        questionId,
        isCorrect,
        message: isCorrect ? 'Correct answer!' : 'Incorrect answer',
        newScore,
        explanation: evaluationResult.explanation
      }
    }));

    // Broadcast updated scores to all participants
    broadcastScoresUpdate(sessionId);
  } catch (error) {
    console.error('Error handling answer submission:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Error processing answer' }
    }));
  }
};

const startQuiz = async (sessionId: string) => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return;
  }

  try {
    session.startTime = new Date();

    // Update in Redis
    await RedisQuizService.setQuizActive(sessionId, true);

    // Get the quiz ID from the session data
    const sessionData = await RedisQuizService.getQuizSession(sessionId);
    if (!sessionData) {
      console.error('Session data not found in Redis:', sessionId);
      // Notify participants of error
      session.participants.forEach(ws => {
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Session data not found' }
        }));
      });
      return;
    }

    const quizId = parseInt(sessionData.quizId || '0');

    // Get questions for this quiz from the database
    const quizService = await import('../services/quizService');
    const questions = await quizService.QuizService.getQuestionsForQuiz(quizId);

    if (questions.length === 0) {
      console.error('No questions found for quiz:', quizId);
      // Notify participants of error
      session.participants.forEach(ws => {
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'No questions available for this quiz' }
        }));
      });
      return;
    }

    // Store questions in Redis for quick access during the quiz
    await redisClient.set(`quiz_questions:${sessionId}`, JSON.stringify(questions));

    // Shuffle questions if needed (based on quiz settings)
    // For now, we'll just use the order from the database

    // Broadcast to all participants that quiz has started
    session.participants.forEach(ws => {
      ws.send(JSON.stringify({
        type: 'quiz_started',
        payload: {
          sessionId,
          message: 'Quiz has started!',
          startTime: session!.startTime,
          totalQuestions: questions.length
        }
      }));
    });

    // Automatically trigger the first question
    await nextQuestion(sessionId);
  } catch (error) {
    console.error('Error in startQuiz:', error);
    // Notify participants of error
    session.participants.forEach(ws => {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Failed to start quiz' }
      }));
    });
  }
};

const nextQuestion = async (sessionId: string) => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return;
  }

  try {
    session.currentQuestionIndex++;

    // Update in Redis
    await RedisQuizService.setCurrentQuestion(sessionId, session.currentQuestionIndex);

    // Get the current question from Redis
    const questionsStr = await redisClient.get(`quiz_questions:${sessionId}`);
    if (!questionsStr) {
      console.error('Questions not found in Redis for session:', sessionId);
      session.participants.forEach(ws => {
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Questions not available' }
        }));
      });
      return;
    }

    const questions = JSON.parse(questionsStr);
    const currentQuestion = questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      // No more questions, quiz is finished
      session.participants.forEach(ws => {
        ws.send(JSON.stringify({
          type: 'quiz_finished',
          payload: {
            sessionId,
            message: 'Quiz finished!'
          }
        }));
      });
      return;
    }

    // Broadcast the current question to all participants
    session.participants.forEach(ws => {
      ws.send(JSON.stringify({
        type: 'next_question',
        payload: {
          sessionId,
          currentQuestionIndex: session.currentQuestionIndex,
          question: {
            id: currentQuestion.id,
            content: currentQuestion.content,
            type: currentQuestion.type,
            options: currentQuestion.options,
            points: currentQuestion.points
          },
          message: 'Next question loaded'
        }
      }));
    });
  } catch (error) {
    console.error('Error in nextQuestion:', error);
    session.participants.forEach(ws => {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Failed to load next question' }
      }));
    });
  }
};

const broadcastScoresUpdate = async (sessionId: string) => {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  // Get scores from Redis to ensure we have the most up-to-date values
  const scores = await RedisQuizService.getAllScores(sessionId);

  // Broadcast to all participants
  session.participants.forEach(ws => {
    ws.send(JSON.stringify({
      type: 'scores_update',
      payload: {
        sessionId,
        scores,
        message: 'Scores updated'
      }
    }));
  });
};

const handleDisconnection = async (ws: WebSocket) => {
  // Get the session ID for this WebSocket connection
  const sessionId = activeConnections.get(ws);
  if (!sessionId) {
    return; // Connection wasn't associated with a session
  }

  // Remove from active connections
  activeConnections.delete(ws);

  // Find and remove the disconnected client from the session
  const session = activeSessions.get(sessionId);
  if (session) {
    const index = session.participants.indexOf(ws);
    if (index !== -1) {
      session.participants.splice(index, 1);

      // Update participant count in Redis
      const players = await RedisQuizService.getPlayersInSession(sessionId);
      const participantCount = players.length;
      await RedisQuizService.updateParticipantCount(sessionId, participantCount);

      // If session is empty, remove it from memory (but keep in Redis for potential later access)
      if (session.participants.length === 0) {
        activeSessions.delete(sessionId);
      } else {
        // Notify remaining participants about the disconnection
        broadcastToOthers(ws, session, {
          type: 'participant_left',
          payload: {
            participantCount,
          }
        });
      }
    }
  }
};

// Add a new handler for explicit leave requests
const handleLeaveQuiz = async (ws: WebSocket, payload: { sessionId: string; userId: string }) => {
  const { sessionId, userId } = payload;

  // Remove player from session in Redis
  await RedisQuizService.removePlayerFromSession(sessionId, userId);

  // Update participant count in Redis
  const players = await RedisQuizService.getPlayersInSession(sessionId);
  const participantCount = players.length;
  await RedisQuizService.updateParticipantCount(sessionId, participantCount);

  // Notify remaining participants about the disconnection
  const session = activeSessions.get(sessionId);
  if (session) {
    broadcastToOthers(ws, session, {
      type: 'participant_left',
      payload: {
        participantCount,
        userId
      }
    });
  }

  // Remove from active connections
  activeConnections.delete(ws);

  // Close the WebSocket connection
  ws.close();
};

const broadcastToOthers = (sender: WebSocket, session: QuizSession, message: any) => {
  session.participants
    .filter(client => client !== sender && client.readyState === WebSocket.OPEN)
    .forEach(client => {
      client.send(JSON.stringify(message));
    });
};