import express from 'express';
import db from '../database.js';
import { z } from 'zod';

const router = express.Router();

const recommendSchema = z.object({
  age: z.number().int().min(0).max(120),
  income: z.number().nonnegative(),
  ownsHome: z.boolean().optional().default(false),
  residency: z.boolean().optional().default(true)
});

// 1. Get all schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await db.getSchemes();
    return res.status(200).json(schemes);
  } catch (error) {
    console.error('Failed to get schemes:', error);
    return res.status(500).json({ error: 'Failed to retrieve schemes catalog' });
  }
});

// 2. Recommend schemes based on user demographics
router.post('/recommend', async (req, res) => {
  try {
    const { age, income, ownsHome, residency } = recommendSchema.parse(req.body);
    const schemes = await db.getSchemes();
    
    // Evaluate logic for recommendations
    const recommendations = schemes.map(scheme => {
      const eligibility = scheme.eligibility;
      const reasons = [];
      let eligible = true;

      if (eligibility.minAge && age < eligibility.minAge) {
        eligible = false;
        reasons.push(`Minimum age required is ${eligibility.minAge} (You are ${age}).`);
      }
      if (eligibility.maxAge && age > eligibility.maxAge) {
        eligible = false;
        reasons.push(`Maximum age limit is ${eligibility.maxAge} (You are ${age}).`);
      }
      if (eligibility.maxIncome && income > eligibility.maxIncome) {
        eligible = false;
        reasons.push(`Income threshold is $${eligibility.maxIncome} (Declared $${income}).`);
      }
      if (eligibility.residencyRequired && !residency) {
        eligible = false;
        reasons.push(`Residency status required.`);
      }
      if (eligibility.ownershipRequired && !ownsHome) {
        eligible = false;
        reasons.push(`Property ownership required.`);
      }

      if (eligible) {
        reasons.push('You fully satisfy all demographic and housing requirements!');
      }

      return {
        ...scheme,
        eligible,
        matchReasons: reasons
      };
    });

    return res.status(200).json({
      recommendations,
      inputContext: { age, income, ownsHome, residency }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Context matching input invalid', details: error.errors });
    }
    console.error('Scheme match processing error:', error);
    return res.status(500).json({ error: 'Recommendation calculation failed' });
  }
});

export default router;
