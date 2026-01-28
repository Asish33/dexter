import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../Button';

interface Player {
  id: string;
  name: string;
  score: number;
}

const MultiplayerQuizResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {

    setTimeout(() => {
      const mockLeaderboard: Player[] = [
        { id: '1', name: 'You', score: 85 },
        { id: '2', name: 'Alice', score: 75 },
        { id: '3', name: 'Bob', score: 65 },
        { id: '4', name: 'Charlie', score: 50 },
        { id: '5', name: 'Diana', score: 45 },
      ];
      
      setLeaderboard(mockLeaderboard);
      const currentUser = mockLeaderboard.find(player => player.name === 'You');
      if (currentUser) {
        const rank = mockLeaderboard.findIndex(p => p.id === currentUser.id) + 1;
        setCurrentUserRank(rank);
      }
      setIsLoading(false);
    }, 1000);
  }, [sessionId]);

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Calculating results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">Quiz Results</h1>
          <p className="text-muted-foreground mt-2">Session ID: {sessionId}</p>
        </header>

        <div className="bg-card rounded-xl border border-border p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Final Scores</h2>
            <p className="text-muted-foreground mt-2">
              {currentUserRank ? `You placed #${currentUserRank} out of ${leaderboard.length} players!` : 'Thanks for participating!'}
            </p>
          </div>

          <div className="space-y-4">
            {leaderboard
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 
                      ? 'bg-yellow-500/10 border border-yellow-500/20' 
                      : player.name === 'You'
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                      index === 0 ? 'bg-yellow-500 text-yellow-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-amber-800 text-amber-100' :
                      player.name === 'You' ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`font-medium ${player.name === 'You' ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {player.name} {player.name === 'You' && '(You)'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {player.score} pts
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={goToDashboard} 
            size="lg" 
            className="px-8 py-3 text-lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerQuizResults;