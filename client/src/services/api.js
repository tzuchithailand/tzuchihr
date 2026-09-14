const API_BASE = '/api';

export async function fetchJobs(status = 'all', interpreter = '') {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (interpreter) params.append('interpreter', interpreter);
  
  const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
  return await res.json();
}

export async function fetchJobById(id) {
  const res = await fetch(`${API_BASE}/jobs/${id}`);
  return await res.json();
}

export async function createJob(jobData) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  return await res.json();
}

export async function checkinJob(id, data) {
  // If data is FormData, send directly (multipart)
  // If data is JSON (with base64Photo), send JSON
  let res;
  if (data instanceof FormData) {
    res = await fetch(`${API_BASE}/jobs/${id}/checkin`, {
      method: 'POST',
      body: data,
    });
  } else {
    res = await fetch(`${API_BASE}/jobs/${id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  return await res.json();
}

export async function uploadMedicalDoc(id, data) {
  let res;
  if (data instanceof FormData) {
    res = await fetch(`${API_BASE}/jobs/${id}/upload-doc`, {
      method: 'POST',
      body: data,
    });
  } else {
    res = await fetch(`${API_BASE}/jobs/${id}/upload-doc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  return await res.json();
}

export async function deleteMedicalDoc(docId) {
  const res = await fetch(`${API_BASE}/docs/${docId}`, {
    method: 'DELETE',
  });
  return await res.json();
}

export async function checkoutJob(id, summaryNotes) {
  const res = await fetch(`${API_BASE}/jobs/${id}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary_notes: summaryNotes }),
  });
  return await res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return await res.json();
}

export async function fetchHospitals() {
  const res = await fetch(`${API_BASE}/hospitals`);
  return await res.json();
}
