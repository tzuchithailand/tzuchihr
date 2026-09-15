const API_BASE = '/api';

// ==============================
// 1. HOSPITAL JOBS & CERTS
// ==============================
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
  let res;
  if (data instanceof FormData) {
    res = await fetch(`${API_BASE}/jobs/${id}/checkin`, { method: 'POST', body: data });
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
    res = await fetch(`${API_BASE}/jobs/${id}/upload-doc`, { method: 'POST', body: data });
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
  const res = await fetch(`${API_BASE}/docs/${docId}`, { method: 'DELETE' });
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

export async function fetchHospitals() {
  const res = await fetch(`${API_BASE}/hospitals`);
  return await res.json();
}

// ==============================
// 2. CLINIC STAFF (เมดิคอลทีม)
// ==============================
export async function fetchStaff(role = 'all', department = 'all') {
  const params = new URLSearchParams();
  if (role && role !== 'all') params.append('role', role);
  if (department && department !== 'all') params.append('department', department);
  const res = await fetch(`${API_BASE}/staff?${params.toString()}`);
  return await res.json();
}

export async function createStaff(data) {
  const res = await fetch(`${API_BASE}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateStaff(id, data) {
  const res = await fetch(`${API_BASE}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteStaff(id) {
  const res = await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
  return await res.json();
}

// ==============================
// 3. INTERPRETERS (ทีมล่าม)
// ==============================
export async function fetchInterpreters(language = 'all', status = 'all') {
  const params = new URLSearchParams();
  if (language && language !== 'all') params.append('language', language);
  if (status && status !== 'all') params.append('status', status);
  const res = await fetch(`${API_BASE}/interpreters?${params.toString()}`);
  return await res.json();
}

export async function createInterpreter(data) {
  const res = await fetch(`${API_BASE}/interpreters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateInterpreter(id, data) {
  const res = await fetch(`${API_BASE}/interpreters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteInterpreter(id) {
  const res = await fetch(`${API_BASE}/interpreters/${id}`, { method: 'DELETE' });
  return await res.json();
}

// ==============================
// 4. SHIFTS (จัดกะแยก 2 ทีม)
// ==============================
export async function fetchShifts(teamType = 'all', date = '') {
  const params = new URLSearchParams();
  if (teamType && teamType !== 'all') params.append('team_type', teamType);
  if (date) params.append('date', date);
  const res = await fetch(`${API_BASE}/shifts?${params.toString()}`);
  return await res.json();
}

export async function createShift(data) {
  const res = await fetch(`${API_BASE}/shifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateShiftStatus(id, status) {
  const res = await fetch(`${API_BASE}/shifts/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return await res.json();
}

export async function deleteShift(id) {
  const res = await fetch(`${API_BASE}/shifts/${id}`, { method: 'DELETE' });
  return await res.json();
}

// Workplaces Management
export async function fetchWorkplaces() {
  const res = await fetch(`${API_BASE}/workplaces`);
  return await res.json();
}

export async function createWorkplace(data) {
  const res = await fetch(`${API_BASE}/workplaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteWorkplace(id) {
  const res = await fetch(`${API_BASE}/workplaces/${id}`, { method: 'DELETE' });
  return await res.json();
}

// ==============================
// 5. HIP CiF93s-VL ATTENDANCE
// ==============================
export async function fetchAttendanceLogs(personType = 'all', date = '') {
  const params = new URLSearchParams();
  if (personType && personType !== 'all') params.append('person_type', personType);
  if (date) params.append('date', date);
  const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
  return await res.json();
}

export async function syncHipDevice(ipAddress, port) {
  const res = await fetch(`${API_BASE}/attendance/sync-hip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip_address: ipAddress, port: port || 4370 }),
  });
  return await res.json();
}

export async function importHipUsbFile(fileOrText) {
  let res;
  if (fileOrText instanceof FormData) {
    res = await fetch(`${API_BASE}/attendance/import-file`, { method: 'POST', body: fileOrText });
  } else {
    res = await fetch(`${API_BASE}/attendance/import-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_content: fileOrText }),
    });
  }
  return await res.json();
}

export async function fetchDeviceConfig() {
  const res = await fetch(`${API_BASE}/attendance/device-config`);
  return await res.json();
}

export async function updateDeviceConfig(data) {
  const res = await fetch(`${API_BASE}/attendance/device-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// ==============================
// 6. PAYROLL & ACCOUNTING (3 หมวด)
// ==============================
export async function fetchPayroll(category = 'all', status = 'all') {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (status && status !== 'all') params.append('status', status);
  const res = await fetch(`${API_BASE}/payroll?${params.toString()}`);
  return await res.json();
}

export async function createPayroll(data) {
  const res = await fetch(`${API_BASE}/payroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updatePayrollStatus(id, status, method = 'โอนผ่านธนาคาร') {
  const res = await fetch(`${API_BASE}/payroll/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_status: status, payment_method: method }),
  });
  return await res.json();
}

export async function autoCalculateHospitalPayroll(jobId) {
  const res = await fetch(`${API_BASE}/payroll/auto-calculate-hospital`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId }),
  });
  return await res.json();
}

// ==============================
// 7. REPORTS & ANALYTICS
// ==============================
export async function fetchExecutiveReport() {
  const res = await fetch(`${API_BASE}/reports/executive`);
  return await res.json();
}
