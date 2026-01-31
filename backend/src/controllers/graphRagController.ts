import { type Request, type Response } from 'express';
import { GraphRagService } from '../services/graphRagService';
import { z } from 'zod';

const ingestSchema = z.object({
    inputType: z.enum(['text', 'url', 'pdf', 'topic']),
    value: z.string().min(1),
});

const generateSchema = z.object({
    graphId: z.string().uuid().or(z.string().min(1)),
    count: z.number().int().positive().optional().default(5),
});

export const ingestData = async (req: Request, res: Response) => {
    try {
        const { inputType, value } = ingestSchema.parse(req.body);

        const result = await GraphRagService.ingestData(inputType, value);

        res.status(200).json({
            message: 'Data ingested successfully',
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.issues });
        }
        console.error('Error in ingestData controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateQuestions = async (req: Request, res: Response) => {
    try {
        const { graphId, count } = generateSchema.parse({
            graphId: req.params.graphId,
            count: req.query.count ? parseInt(req.query.count as string) : undefined
        });

        const result = await GraphRagService.generateQuestions(graphId, count);

        res.status(200).json({
            message: 'Questions generated successfully',
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.issues });
        }
        console.error('Error in generateQuestions controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
