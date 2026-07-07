const BASE_URL = ''; // Proxied via Vite config to http://localhost:5001

export async function chatCompletion(sessionId, message, locale = 'en') {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message, locale })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to chat with AI');
  }
  return response.json();
}

export async function getComplaints() {
  const response = await fetch(`${BASE_URL}/api/complaints`);
  if (!response.ok) throw new Error('Failed to load complaints');
  return response.json();
}

export async function createComplaint(complaint) {
  const response = await fetch(`${BASE_URL}/api/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaint)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create complaint ticket');
  }
  return response.json();
}

export async function simulateComplaintUpdate(id) {
  const response = await fetch(`${BASE_URL}/api/complaints/${id}/simulate-update`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to update complaint status');
  return response.json();
}

export async function getSchemes() {
  const response = await fetch(`${BASE_URL}/api/schemes`);
  if (!response.ok) throw new Error('Failed to fetch schemes catalog');
  return response.json();
}

export async function recommendSchemes(context) {
  const response = await fetch(`${BASE_URL}/api/schemes/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to get recommendations');
  }
  return response.json();
}
