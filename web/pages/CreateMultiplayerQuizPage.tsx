import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Button from '../components/Button';
import { useQuizStore } from '../store/quizStore';
import { gatewayService } from '../services/api';

const CreateMultiplayerQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { formData } = useQuizStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateQuiz = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Create a quiz with AI-generated questions using the gateway service
      const quiz = await gatewayService.createQuizWithAI({
        title: formData.title,
        description: formData.description || '',
        content: [
          ...formData.links,
          ...formData.files.map(file => `File: ${file.name} (${file.size})`)
        ].join('\n'),
        numQuestions: formData.questionCount,
        difficulty: formData.difficulty || 'medium'
      });

      // Start a multiplayer session using the gateway service
      const sessionResult = await gatewayService.startMultiplayerSession({
        quizId: quiz.id,
        maxPlayers: formData.settings.participantLimit
      });

      // Navigate to the lobby
      navigate(`/quiz/${sessionResult.sessionId}/lobby`);
      toast.success('Multiplayer quiz created successfully!');
    } catch (err: any) {
      console.error('Error creating multiplayer quiz:', err);
      const errorMessage = err.message || 'Failed to create multiplayer quiz. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Multiplayer Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Transform your content into an engaging multiplayer quiz experience
          </p>
        </header>

        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Quiz Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground">Title</h3>
                  <p className="text-muted-foreground">{formData.title || 'Untitled Quiz'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Description</h3>
                  <p className="text-muted-foreground">{formData.description || 'No description'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Questions</h3>
                  <p className="text-muted-foreground">{formData.questionCount} questions</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Max Players</h3>
                  <p className="text-muted-foreground">{formData.settings.participantLimit}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Content Sources</h2>
              <div className="space-y-3">
                {formData.files.length > 0 && (
                  <div>
                    <h3 className="font-medium text-foreground">Files</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {formData.files.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.links.length > 0 && (
                  <div>
                    <h3 className="font-medium text-foreground">Links</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {formData.links.map((link, idx) => (
                        <li key={idx} className="truncate">{link}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.topic && (
                  <div>
                    <h3 className="font-medium text-foreground">Topic</h3>
                    <p className="text-muted-foreground">{formData.topic}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleCreateQuiz}
            disabled={isCreating || !formData.title || (formData.files.length === 0 && formData.links.length === 0)}
            className="px-8 py-3 text-lg"
          >
            {isCreating ? 'Creating...' : 'Create Multiplayer Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMultiplayerQuizPage;