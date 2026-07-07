import fs from 'fs/promises';
import { existsSync } from 'fs';
import { config } from './config.js';

// Seed Data
const initialSchemes = [
  {
    id: 'scheme-1',
    name: 'Green City Clean Energy Subsidy',
    category: 'Environment & Energy',
    description: 'Provides financial support of up to 50% for citizens installing solar panels, rainwater harvesting systems, or composting units at their residential properties.',
    eligibility: {
      minAge: 18,
      maxIncome: 120000,
      residencyRequired: true,
      ownershipRequired: true
    },
    documents: [
      'Proof of Identity (Aadhaar/Driver License)',
      'Proof of Property Ownership (Property Tax Receipt)',
      'Income Certificate (Latest tax filings or pay stubs)',
      'Installation Quote/Estimate from an approved vendor'
    ],
    simpleLanguage: 'Get half your money back from the government when you install home solar or rainwater systems. You must own your home and earn under $120,000/year.'
  },
  {
    id: 'scheme-2',
    name: 'Universal Senior Citizens Healthcare Support',
    category: 'Healthcare & Wellness',
    description: 'A comprehensive medical insurance scheme offering cashless medical treatment up to $5,000 annually at all government and empanelled private hospitals.',
    eligibility: {
      minAge: 60,
      maxIncome: null,
      residencyRequired: true,
      ownershipRequired: false
    },
    documents: [
      'Proof of Age (Birth Certificate/Passport)',
      'Proof of Residency (Utility Bill or Rent Agreement)',
      'Active Health Insurance ID (if any)'
    ],
    simpleLanguage: 'Free healthcare insurance up to $5,000 every year for seniors aged 60 and older. Works at all government and partner hospitals. No income limit.'
  },
  {
    id: 'scheme-3',
    name: 'Empower Youth Digital Literacy Grant',
    category: 'Education & Employment',
    description: 'A skill development initiative providing free coding bootcamps, digital marketing training, and a one-time stipend of $300 for purchasing learning devices.',
    eligibility: {
      minAge: 18,
      maxAge: 30,
      maxIncome: 50000,
      residencyRequired: false,
      ownershipRequired: false
    },
    documents: [
      'Proof of Identity',
      'Educational Certificates (High school diploma or equivalent)',
      'Income Certificate'
    ],
    simpleLanguage: 'Free programming or digital marketing courses, plus $300 for a laptop, for young adults aged 18-30 earning under $50,000/year.'
  },
  {
    id: 'scheme-4',
    name: 'Inclusive Public Housing Rental Aid',
    category: 'Housing & Urban Planning',
    description: 'Rental assistance program providing monthly subsidies of up to $250 directly to landlords of low-income families to ensure safe housing.',
    eligibility: {
      minAge: 18,
      maxIncome: 35000,
      residencyRequired: true,
      ownershipRequired: false
    },
    documents: [
      'Valid Rental Lease Agreement',
      'Proof of Low Income (Government assistance proof or bank statements)',
      'Proof of Identity for all family members'
    ],
    simpleLanguage: 'Monthly housing assistance of up to $250 paid directly to your landlord if your household earns less than $35,000/year.'
  }
];

const initialComplaints = [
  {
    id: 'complaint-101',
    title: 'Severe Pothole on Maple Avenue',
    category: 'Roads & Infrastructure',
    description: 'A deep pothole has formed in the middle of Maple Avenue, near intersection 4th Street. Multiple cars damaged tires today. Requires urgent patching.',
    location: 'Maple Avenue & 4th Street',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    status: 'In Progress',
    severity: 'Medium',
    priority: 'Medium',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updates: [
      { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), message: 'Complaint registered by citizen.' },
      { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), message: 'Assigned to Public Works Department.' }
    ]
  },
  {
    id: 'complaint-102',
    title: 'Flickering Streetlight - Danger at Night',
    category: 'Public Lighting',
    description: 'Streetlight #87-B is completely dead/flickering. The block is extremely dark at night, causing safety concerns for walking pedestrians.',
    location: 'Oak Street (Outside Community Center)',
    coordinates: { lat: 37.7833, lng: -122.4167 },
    status: 'Submitted',
    severity: 'Low',
    priority: 'Low',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
    updates: [
      { timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), message: 'Complaint submitted.' }
    ]
  },
  {
    id: 'complaint-103',
    title: 'EMERGENCY: Exposed Main Electrical Cable',
    category: 'Electricity & Utilities',
    description: 'An underground power conduit has cracked, and a heavy electrical wire is lying exposed on the sidewalk near the playground. Rain is forecast.',
    location: 'Hillside Playground Entrance',
    coordinates: { lat: 37.7699, lng: -122.4468 },
    status: 'Under Review',
    severity: 'Critical',
    priority: 'High',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
    updates: [
      { timestamp: new Date(Date.now() - 45 * 60000).toISOString(), message: 'Urgent complaint logged. Triggered automatic severity escalation.' },
      { timestamp: new Date(Date.now() - 30 * 60000).toISOString(), message: 'Utility dispatch team notified for emergency isolation.' }
    ]
  }
];

class Database {
  constructor() {
    this.path = config.dbPath;
    this.data = {
      schemes: [],
      complaints: [],
      sessions: {}
    };
  }

  async init() {
    try {
      if (existsSync(this.path)) {
        const fileContent = await fs.readFile(this.path, 'utf8');
        this.data = JSON.parse(fileContent);
        console.log(`Database loaded successfully from ${this.path}`);
      } else {
        // Initialize with seed data
        this.data = {
          schemes: initialSchemes,
          complaints: initialComplaints,
          sessions: {}
        };
        await this.save();
        console.log(`Database initialized and seeded at ${this.path}`);
      }
    } catch (error) {
      console.error('Failed to initialize database, falling back to in-memory store:', error);
      this.data = {
        schemes: initialSchemes,
        complaints: initialComplaints,
        sessions: {}
      };
    }
  }

  async save() {
    try {
      await fs.writeFile(this.path, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Database write error:', error);
    }
  }

  // Complaints
  async getComplaints() {
    return this.data.complaints;
  }

  async getComplaintById(id) {
    return this.data.complaints.find(c => c.id === id) || null;
  }

  async addComplaint(complaint) {
    const newComplaint = {
      id: `complaint-${Date.now()}`,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updates: [
        { timestamp: new Date().toISOString(), message: 'Complaint registered by system.' }
      ],
      ...complaint
    };
    this.data.complaints.unshift(newComplaint);
    await this.save();
    return newComplaint;
  }

  async updateComplaintStatus(id, status, updateMessage) {
    const complaint = this.data.complaints.find(c => c.id === id);
    if (complaint) {
      complaint.status = status;
      complaint.updates.push({
        timestamp: new Date().toISOString(),
        message: updateMessage || `Status changed to ${status}`
      });
      await this.save();
      return complaint;
    }
    return null;
  }

  // Schemes
  async getSchemes() {
    return this.data.schemes;
  }

  // AI Session Memory (Context)
  async getSession(sessionId) {
    return this.data.sessions[sessionId] || { history: [], userContext: {} };
  }

  async saveSession(sessionId, sessionData) {
    this.data.sessions[sessionId] = sessionData;
    await this.save();
    return sessionData;
  }
}

const db = new Database();
export default db;
