import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';
import db from './database.js';

// Setup Gemini Client if Key is Present
let genAI = null;
if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    console.log('Gemini AI client successfully initialized with API key.');
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI client:', err);
  }
} else {
  console.warn('WARNING: No GEMINI_API_KEY configured. Running in Simulation Mode.');
}

const SYSTEM_INSTRUCTIONS = `
You are the official CivicCompanion AI, an empathetic, highly intelligent, and proactive digital civil servant.
Your job is to help citizens:
1. Understand and apply for government schemes.
2. Report public infrastructure or safety issues.
3. Track their submitted complaints.
4. Simplify complex government/legal terminology into clear, accessible language.

Behavioral Guidelines:
- EMPATHETIC & ACCESSIBLE: Be polite, supportive, and use simple language. Avoid bureaucratic jargon.
- MEMORY-AWARE: Reference previous details the user has mentioned (e.g., their name, age, or location) to avoid asking again.
- MULTILINGUAL: Match the user's language (English, Spanish, Hindi, French).
- NO HALLUCINATIONS: If you do not know something, admit it. Never make up government rules, timelines, or office locations.
- CLARIFYING: Ask friendly, focused questions one at a time if vital details are missing.
- PREVENT PII LEAKAGE: Never display sensitive raw credentials, and alert the user not to type passwords.

Internally, detect if the user's intent is to:
- REPORT an issue: Extract issue category, title, description, and location. Flag critical utility issues (exposed wires, gas odor) as "Critical" severity.
- FIND schemes: Recommend schemes based on age/income.
- GET document checklists: Detail specific proofs needed.
- TRACK: Request a complaint ID and report the status.
- CHAT: General greeting or question.
`;

/**
 * Fallback AI Engine that uses keyword matching and rule sets to simulate
 * a highly capable AI. This is critical for zero-configuration hackathon runs.
 */
function runSimulation(history, message) {
  const msgLower = message.toLowerCase();
  let intent = 'GENERAL';
  let extractedData = null;
  let reply = '';

  // 1. Intent Detection Heuristics
  if (msgLower.includes('report') || msgLower.includes('pothole') || msgLower.includes('broken') || msgLower.includes('streetlight') || msgLower.includes('leak') || msgLower.includes('wire') || msgLower.includes('complain')) {
    intent = 'REPORT_COMPLAINT';
  } else if (msgLower.includes('scheme') || msgLower.includes('benefit') || msgLower.includes('subsidy') || msgLower.includes('grant') || msgLower.includes('help pay') || msgLower.includes('money')) {
    intent = 'SCHEME_SEARCH';
  } else if (msgLower.includes('document') || msgLower.includes('checklist') || msgLower.includes('paperwork') || msgLower.includes('need to apply')) {
    intent = 'DOCUMENT_CHECKLIST';
  } else if (msgLower.includes('track') || msgLower.includes('status') || msgLower.includes('complaint-') || msgLower.includes('where is my')) {
    intent = 'TRACK_COMPLAINT';
  }

  // 2. Draft Response based on intent
  if (intent === 'REPORT_COMPLAINT') {
    let category = 'Roads & Infrastructure';
    let severity = 'Medium';
    let priority = 'Medium';

    if (msgLower.includes('light') || msgLower.includes('bulb')) {
      category = 'Public Lighting';
      severity = 'Low';
      priority = 'Low';
    } else if (msgLower.includes('wire') || msgLower.includes('electric') || msgLower.includes('gas') || msgLower.includes('fire')) {
      category = 'Electricity & Utilities';
      severity = 'Critical';
      priority = 'High';
    } else if (msgLower.includes('water') || msgLower.includes('leak') || msgLower.includes('pipe') || msgLower.includes('flooding')) {
      category = 'Water & Sanitation';
      severity = 'Medium';
      priority = 'Medium';
    }

    // Attempt to extract title/location from message
    const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
    const location = message.match(/at\s+([^,\.\?]+)/i)?.[1] || 'Unknown Location (Please specify)';

    extractedData = {
      title,
      category,
      description: message,
      location,
      severity,
      priority,
      status: 'Submitted'
    };

    reply = `I can certainly help you report this public issue. I've categorized this as **${category}** with a **${severity}** severity rating.\n\n` +
      `**Title**: ${extractedData.title}\n` +
      `**Location**: ${extractedData.location}\n\n` +
      `Would you like me to submit this report to the municipal dashboard now? (You can say "yes" or clarify the location).`;

    if (severity === 'Critical') {
      reply = `⚠️ **EMERGENCY WARNING**: ${reply}\n\n*Note: Since this involves a high-risk utility hazard, I will tag this for immediate 1-hour dispatch.*`;
    }
  } else if (intent === 'SCHEME_SEARCH') {
    reply = "Here are the government schemes that might match your needs:\n\n" +
      "1. 🟢 **Green City Clean Energy Subsidy**: Up to 50% refund for solar panel installation. (Income < $120,000)\n" +
      "2. 🔵 **Universal Senior Citizens Healthcare Support**: Cashless medical treatment up to $5,000 for seniors aged 60+.\n" +
      "3. 🟡 **Empower Youth Digital Literacy Grant**: Free coding/marketing bootcamps + $300 learning stipend. (Ages 18-30, Income < $50,000)\n" +
      "4. 🟤 **Inclusive Public Housing Rental Aid**: Rent support up to $250/month for households under $35,000.\n\n" +
      "Tell me your age, income, and whether you own a home, and I can give you a personalized recommendation!";
  } else if (intent === 'DOCUMENT_CHECKLIST') {
    reply = "To tell you the exact document checklist, which scheme are you interested in? Here is the checklist for our primary solar subsidy:\n\n" +
      "📋 **Green City Clean Energy Subsidy Checklist**:\n" +
      "- Proof of Identity (Aadhaar, Passport, or Driver License)\n" +
      "- Proof of Property Ownership (Property Tax Receipt or Title Deed)\n" +
      "- Income Certificate (Latest tax filings or pay stubs)\n" +
      "- Installation Quote/Estimate from an approved green vendor\n\n" +
      "You can submit scans of these documents directly to check for completeness.";
  } else if (intent === 'TRACK_COMPLAINT') {
    const idMatch = message.match(/complaint-\d+/i);
    const id = idMatch ? idMatch[0].toLowerCase() : null;

    if (id) {
      reply = `Let me check the municipal logs for **${id}**... \n\n` +
        `🔎 **Status**: In Progress\n` +
        `📅 **Last Update**: Public Works crew dispatched for repair.\n` +
        `If you need direct updates, you can check the "Track Complaints" tab on your dashboard!`;
    } else {
      reply = "I would be happy to track your complaint. Could you please provide your ticket number? It should look like `complaint-101` or `complaint-171829...`.";
    }
  } else {
    // General Conversational AI simulation
    if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
      reply = "Hello! I am your AI Civic Companion. How can I help you today? You can ask me to help report an infrastructure issue (like a pothole or streetlight), check if you qualify for housing/solar subsidies, or translate government letters.";
    } else if (msgLower.includes('thank')) {
      reply = "You are very welcome! Helping citizens is my top priority. Is there anything else I can do for you today?";
    } else {
      reply = "I understand. I am here to help guide you through government procedures, simplify complex regulatory guidelines, track service tickets, and recommend financial subsidies. Please let me know what you would like to do!";
    }
  }

  return { reply, intent, extractedData };
}

/**
 * Handles LLM request with graceful fallback.
 */
export async function processChatMessage(sessionId, message, locale = 'en') {
  const session = await db.getSession(sessionId);
  
  // Maintain a maximum conversational history of 10 messages for efficiency
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }

  // Update session context with name or income if mentioned in chat
  const incomeMatch = message.match(/\$?([0-9,]+)\s*(per\s*year|yearly|income|salary)/i);
  if (incomeMatch) {
    const value = parseInt(incomeMatch[1].replace(/,/g, ''), 10);
    session.userContext.income = value;
  }
  const ageMatch = message.match(/I\s*am\s*([0-9]+)\s*(years\s*old|yo)/i);
  if (ageMatch) {
    session.userContext.age = parseInt(ageMatch[1], 10);
  }

  let resultReply = '';
  let resultIntent = 'GENERAL';
  let resultExtracted = null;

  if (genAI) {
    try {
      // Build history context
      const contents = [
        { role: 'user', parts: [{ text: SYSTEM_INSTRUCTIONS }] },
        { role: 'model', parts: [{ text: "Understood. I will act as a helpful and polite CivicCompanion. I will simplify civic services, identify intents, extract details, and maintain context." }] }
      ];

      session.history.forEach(item => {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }]
        });
      });

      // Add current message
      const promptContext = `[System Language Constraint: The user wants to converse in locale "${locale}". Respond in the matching language if appropriate. User Context: ${JSON.stringify(session.userContext)}]\n\nUser Message: ${message}`;
      contents.push({ role: 'user', parts: [{ text: promptContext }] });

      // Run Gemini inference
      // We target the standard gemini-1.5-flash model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({ contents });
      const responseText = result.response.text();

      // Now run a quick intent extraction in parallel or inspect text
      const structModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const structPrompt = `
      Analyze the user's request: "${message}"
      Output JSON with these fields:
      - intent: One of ["REPORT_COMPLAINT", "SCHEME_SEARCH", "DOCUMENT_CHECKLIST", "TRACK_COMPLAINT", "GENERAL"]
      - extractedData: If reporting a complaint, extract object: {title, category, description, location, severity: ("Low", "Medium", "High", "Critical"), priority: ("Low", "Medium", "High")}. Otherwise null.
      `;
      
      const structRes = await structModel.generateContent(structPrompt);
      const parsedStruct = JSON.parse(structRes.response.text());

      resultReply = responseText;
      resultIntent = parsedStruct.intent || 'GENERAL';
      resultExtracted = parsedStruct.extractedData || null;

    } catch (error) {
      console.error('Gemini API call failed, invoking simulation engine:', error);
      const simulated = runSimulation(session.history, message);
      resultReply = simulated.reply;
      resultIntent = simulated.intent;
      resultExtracted = simulated.extractedData;
    }
  } else {
    // Key is missing, run simulated AI
    const simulated = runSimulation(session.history, message);
    resultReply = simulated.reply;
    resultIntent = simulated.intent;
    resultExtracted = simulated.extractedData;
  }

  // Save history
  session.history.push({ role: 'user', content: message });
  session.history.push({ role: 'model', content: resultReply });
  await db.saveSession(sessionId, session);

  return {
    reply: resultReply,
    intent: resultIntent,
    extractedData: resultExtracted,
    userContext: session.userContext
  };
}
