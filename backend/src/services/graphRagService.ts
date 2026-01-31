import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GRAPH_RAG_API_URL = process.env.GRAPH_RAG_API_URL || 'https://dexter-9r6w.onrender.com';

interface IngestResponse {
    status: string;
    chunks: number;
    graph_id: string;
}

interface GenerateResponse {
    mcqs: Array<{
        question: string;
        options: string[];
        answer: string;
        explanation?: string;
    }>;
}

export class GraphRagService {
    /**
     * Ingest data into the Graph RAG system
     */
    static async ingestData(inputType: 'text' | 'url' | 'pdf' | 'topic', value: string): Promise<IngestResponse> {
        try {
            const response = await axios.post<IngestResponse>(`${GRAPH_RAG_API_URL}/api/ingest`, {
                input_type: inputType,
                value,
            });
            return response.data;
        } catch (error) {
            console.error('Error ingesting data into Graph RAG:', error);
            throw new Error('Failed to ingest data');
        }
    }

    /**
     * Generate MCQs from a specific graph ID
     */
    static async generateQuestions(graphId: string, count: number = 5): Promise<GenerateResponse> {
        try {
            const response = await axios.get<GenerateResponse>(`${GRAPH_RAG_API_URL}/api/generate/${graphId}/${count}`);
            return response.data;
        } catch (error) {
            console.error('Error generating questions from Graph RAG:', error);
            throw new Error('Failed to generate questions');
        }
    }
}
