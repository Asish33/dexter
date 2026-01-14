import { create } from 'zustand';

export type Question = {
    id: number;
    text: string;
    options: { id: number; text: string; isCorrect: boolean }[];
    answer?: string;
    explanation?: string;
    source?: string;
    context_quote?: string;
};


export type FormData = {
    title: string;
    description: string;
    files: { name: string; size: string; type: string }[];
    links: string[];
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number; // Added
    questionType: 'mcq' | 'true_false' | 'mixed'; // Added
    questions: Question[];
    settings: {
        timer: number;
        participantLimit: number;
        showLeaderboard: boolean;
        shuffleQuestions: boolean;
        showTeacherNotes: boolean; // Added
        gameMode: 'classic' | 'team' | 'speed';
    }
};

interface QuizState {
    step: number;
    sessionId: string;
    formData: FormData;
    ingestionStatus: 'idle' | 'loading' | 'success' | 'error';
    isGenerating: boolean;

    // Actions
    setStep: (step: number) => void;
    updateFormData: (field: keyof FormData, value: any) => void;
    addLink: (url: string) => Promise<void>;
    addFile: (file: File) => Promise<void>;
    removeLink: (idx: number) => void;
    removeFile: (idx: number) => void;
    generateQuestions: () => Promise<void>;
    updateQuestions: (questions: Question[]) => void;
    reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    step: 1,
    sessionId: crypto.randomUUID(),
    ingestionStatus: 'idle',
    isGenerating: false,
    formData: {
        title: '',
        description: '',
        files: [],
        links: [],
        topic: '',
        difficulty: 'medium',
        questionCount: 10,
        questionType: 'mcq',
        questions: [],
        settings: {
            timer: 30,
            participantLimit: 50,
            showLeaderboard: true,
            shuffleQuestions: true,
            showTeacherNotes: true,
            gameMode: 'classic'
        }
    },

    setStep: (step) => set({ step }),

    updateFormData: (field, value) =>
        set((state) => {
            const newState = { ...state.formData, [field]: value };
            // Clear questions if dependencies change to trigger regeneration
            if (['title', 'topic', 'difficulty', 'files', 'links', 'questionCount', 'questionType'].includes(field)) {
                newState.questions = [];
            }
            return { formData: newState };
        }),

    addLink: async (url) => {
        set({ ingestionStatus: 'loading' });
        const { sessionId, formData } = get();

        try {
            const res = await fetch('http://localhost:8000/ingest/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, document_id: sessionId })
            });

            if (!res.ok) throw new Error("Ingestion failed");

            set((state) => ({
                formData: { ...state.formData, links: [...state.formData.links, url] },
                ingestionStatus: 'success'
            }));

            // Reset status after a delay so UI can show success tick
            setTimeout(() => set({ ingestionStatus: 'idle' }), 2000);

        } catch (e) {
            console.error(e);
            set({ ingestionStatus: 'error' });
            alert("Failed to read this website. It might be blocked or empty.");
        }
    },

    addFile: async (file) => {
        set({ ingestionStatus: 'loading' });
        const { sessionId } = get();
        const formData = new FormData(); // Browser FormData
        formData.append('file', file);
        formData.append('document_id', sessionId);

        try {
            const res = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            const fileData = {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.name.split('.').pop() || 'file'
            };

            set((state) => ({
                formData: { ...state.formData, files: [...state.formData.files, fileData] },
                ingestionStatus: 'success'
            }));
            setTimeout(() => set({ ingestionStatus: 'idle' }), 2000);

        } catch (e) {
            console.error(e);
            set({ ingestionStatus: 'error' });
        }
    },

    removeLink: (idx) =>
        set((state) => {
            const newLinks = state.formData.links.filter((_, i) => i !== idx);
            // If no resources left, rotate session ID to clear backend context
            const shouldReset = newLinks.length === 0 && state.formData.files.length === 0;
            return {
                sessionId: shouldReset ? crypto.randomUUID() : state.sessionId,
                formData: {
                    ...state.formData,
                    links: newLinks
                }
            };
        }),

    removeFile: (idx) =>
        set((state) => {
            const newFiles = state.formData.files.filter((_, i) => i !== idx);
            // If no resources left, rotate session ID to clear backend context
            const shouldReset = newFiles.length === 0 && state.formData.links.length === 0;
            return {
                sessionId: shouldReset ? crypto.randomUUID() : state.sessionId,
                formData: {
                    ...state.formData,
                    files: newFiles
                }
            };
        }),

    generateQuestions: async () => {
        set({ isGenerating: true });
        const { sessionId, formData } = get();

        try {
            const res = await fetch('http://localhost:8000/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    document_id: sessionId,
                    difficulty: formData.difficulty,
                    count: formData.questionCount,
                    mode: formData.questionType,
                    options: 4,
                    topic: formData.topic
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.detail || "Generation failed");
            }

            const data = await res.json();

            // Map response to internal format
            const questions: Question[] = data.questions.map((q: any, i: number) => ({
                id: i + 1,
                text: q.question,
                options: q.options ? q.options.map((opt: string, oid: number) => ({
                    id: oid + 1,
                    text: opt,
                    isCorrect: opt === q.correct_answer
                })) : [],
                answer: q.answer,
                explanation: q.explanation,
                source: q.source,
                context_quote: q.context_quote
            }));

            set((state) => ({
                formData: { ...state.formData, questions },
                isGenerating: false,
                step: 3 // auto advance
            }));

        } catch (e: any) {
            console.error(e);
            set({ isGenerating: false });
            alert(e.message || "Failed to generate questions. Ensure you have added content.");
        }
    },

    updateQuestions: (questions) =>
        set((state) => ({ formData: { ...state.formData, questions } })),

    reset: () => set({
        step: 1,
        sessionId: crypto.randomUUID(),
        ingestionStatus: 'idle',
        isGenerating: false,
        formData: {
            title: '',
            description: '',
            files: [],
            links: [],
            topic: '',
            difficulty: 'medium',
            questionCount: 10,
            questionType: 'mcq',
            questions: [],
            settings: {
                timer: 30,
                participantLimit: 50,
                showLeaderboard: true,
                shuffleQuestions: true,
                showTeacherNotes: true,
                gameMode: 'classic'
            }
        }
    })
}));
