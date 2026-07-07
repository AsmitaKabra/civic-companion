import express from 'express';
import { processChatMessage } from '../ai.js';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// 1. Rate Limiter specifically for AI Chat (prevent API abuse)
const chatLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // max 20 chat messages per minute per IP
  message: { error: 'Too many chat requests. Please slow down.' }
});

// 2. Request validation schema
const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  locale: z.string().optional().default('en')
});

// 3. Simple PII Masking utility to scrub names/phones/SSN before feeding to LLM
function maskPII(text) {
  let cleaned = text;
  // Match Social Security Numbers or standard national IDs (e.g. XXX-XX-XXXX)
  cleaned = cleaned.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[CONFIDENTIAL ID]');
  // Match Credit Card Numbers (13 to 16 digits)
  cleaned = cleaned.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CONFIDENTIAL CARD]');
  // Match Phone Numbers (e.g., +1-555-555-5555 or 555-555-5555)
  cleaned = cleaned.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[CONFIDENTIAL PHONE]');
  // Match Emails
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[CONFIDENTIAL EMAIL]');
  return cleaned;
}

router.post('/', chatLimiter, async (req, res) => {
  try {
    const validated = chatSchema.parse(req.body);
    
    // Mask sensitive details to prevent passing PII to LLM
    const safeMessage = maskPII(validated.message);

    const aiResult = await processChatMessage(
      validated.sessionId,
      safeMessage,
      validated.locale
    );

    return res.status(200).json(aiResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Chat routing error:', error);
    return res.status(500).json({ error: 'An internal error occurred during chat processing' });
  }
});

export default router;
