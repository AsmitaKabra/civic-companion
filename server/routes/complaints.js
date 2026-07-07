import express from 'express';
import db from '../database.js';
import { z } from 'zod';

const router = express.Router();

const complaintSchema = z.object({
  title: z.string().min(3).max(100),
  category: z.string().min(2).max(50),
  description: z.string().min(5).max(1000),
  location: z.string().min(3).max(200),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium')
});

// Helper for XSS sanitization (simple html tag removal)
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

// 1. Get all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await db.getComplaints();
    return res.status(200).json(complaints);
  } catch (error) {
    console.error('Failed to get complaints:', error);
    return res.status(500).json({ error: 'Failed to retrieve complaints database' });
  }
});

// 2. Get single complaint
router.get('/:id', async (req, res) => {
  try {
    const complaint = await db.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint ticket not found' });
    }
    return res.status(200).json(complaint);
  } catch (error) {
    console.error('Failed to get complaint:', error);
    return res.status(500).json({ error: 'Failed to query complaint record' });
  }
});

// 3. Create a complaint
router.post('/', async (req, res) => {
  try {
    const validated = complaintSchema.parse(req.body);
    
    // Sanitize values to prevent XSS
    const sanitized = {
      title: sanitizeInput(validated.title),
      category: sanitizeInput(validated.category),
      description: sanitizeInput(validated.description),
      location: sanitizeInput(validated.location),
      coordinates: validated.coordinates || { lat: 37.7749, lng: -122.4194 },
      severity: validated.severity,
      priority: validated.priority
    };

    // Smart override: check for utility emergency keywords in description
    const descLower = sanitized.description.toLowerCase();
    if (descLower.includes('exposed wire') || descLower.includes('downed line') || descLower.includes('gas leak') || descLower.includes('spill')) {
      sanitized.severity = 'Critical';
      sanitized.priority = 'High';
    }

    const complaint = await db.addComplaint(sanitized);
    return res.status(201).json(complaint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Input validation failed', details: error.errors });
    }
    console.error('Complaint creation failure:', error);
    return res.status(500).json({ error: 'Could not log complaint' });
  }
});

// 4. Hackathon simulation tool: triggers automatic progress updates on a ticket
router.post('/:id/simulate-update', async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await db.getComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    let nextStatus = 'In Progress';
    let message = 'Crew dispatched for site inspection.';

    if (complaint.status === 'Submitted') {
      nextStatus = 'Under Review';
      message = 'Case files transferred to the designated regional inspector.';
    } else if (complaint.status === 'Under Review') {
      nextStatus = 'In Progress';
      message = 'Repair crew has arrived on site.';
    } else if (complaint.status === 'In Progress') {
      nextStatus = 'Resolved';
      message = 'Repairs completed and verified. System closed.';
    } else if (complaint.status === 'Resolved') {
      nextStatus = 'Submitted';
      message = 'Re-opened ticket at citizen request.';
    }

    const updated = await db.updateComplaintStatus(id, nextStatus, message);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update simulation failure:', error);
    return res.status(500).json({ error: 'Failed to simulate state transition' });
  }
});

export default router;
