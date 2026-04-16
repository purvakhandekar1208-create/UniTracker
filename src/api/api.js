const BASE_URL = "http://localhost:8081";

export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken  = ()      => localStorage.getItem("token");
export const saveUser  = (user)  => localStorage.setItem("user", JSON.stringify(user));
export const getUser   = ()      => JSON.parse(localStorage.getItem("user") || "null");
export const logout    = ()      => { localStorage.removeItem("token"); localStorage.removeItem("user"); };

const api = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════

export const login = async (email, password, role) => {
  const data = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  saveToken(data.token);
  saveUser(data);
  return data;
};

export const register = async (fields) => {
  const data = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name:       fields.name,
      email:      fields.email,
      password:   fields.password,
      role:       fields.role,
      phone:      fields.phone      || "",
      roll:       fields.roll       || "",
      division:   fields.division   || "",
      batch:      fields.batch      || "",
      department: fields.department || "",
      year:       fields.year       || "",
      semester:   fields.semester   || "",
    }),
  });
  saveToken(data.token);
  saveUser(data);
  return data;
};

// ═══════════════════════════════════════════════════════════════════
// MENTEE
// ═══════════════════════════════════════════════════════════════════

export const getMenteeProfile    = () => api("/api/mentee/profile");
export const getMenteeDashboard  = () => api("/api/mentee/dashboard");
export const getMenteeMarks      = () => api("/api/mentee/marks");
export const getMenteeAttendance = () => api("/api/mentee/attendance");
export const getMenteeCerts      = () => api("/api/mentee/certificates");
export const getMenteeRemarks    = () => api("/api/mentee/remarks");

// GPA — semester-wise SGPA/CGPA stored in DB
export const getMenteeGpa = () => api("/api/mentee/gpa");
export const saveMenteeGpa = (semester, sgpa, cgpa) =>
  api("/api/mentee/gpa", {
    method: "POST",
    body: JSON.stringify({ semester, sgpa, cgpa }),
  });

export const updateMenteeProfile = (fields) =>
  api("/api/mentee/profile", {
    method: "PUT",
    body: JSON.stringify(fields),
  });

export const uploadCertificate = async (formData) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/mentee/certificates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
};

// ═══════════════════════════════════════════════════════════════════
// MENTOR
// ═══════════════════════════════════════════════════════════════════

export const getMentorDashboard      = () => api("/api/mentor/dashboard");
export const getAllMentees           = () => api("/api/mentor/mentees");

export const getMenteeMarksById      = (id) => api(`/api/mentor/mentees/${id}/marks`);
export const getMenteeAttendanceById = (id) => api(`/api/mentor/mentees/${id}/attendance`);
export const getMenteeCertsById      = (id) => api(`/api/mentor/mentees/${id}/certificates`);
export const getMenteeRemarksById    = (id) => api(`/api/mentor/mentees/${id}/remarks`);
export const getMenteeGpaById        = (id) => api(`/api/mentor/mentees/${id}/gpa`);

export const addRemark = (menteeId, message) =>
  api(`/api/mentor/mentees/${menteeId}/remarks`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

// Mentor adds/updates a specific month's attendance record
export const addMenteeAttendanceRecord = (menteeId, month, percentage) =>
  api(`/api/mentor/mentees/${menteeId}/attendance`, {
    method: "POST",
    body: JSON.stringify({ month, percentage }),
  });

// Legacy overall override (PUT)
export const updateMenteeAttendance = (menteeId, percentage) =>
  api(`/api/mentor/mentees/${menteeId}/attendance`, {
    method: "PUT",
    body: JSON.stringify({ percentage }),
  });

// ── Mentor batch management (persists to DB) ──────────────────────────────────
export const getMentorBatches  = ()              => api("/api/mentor/batches");
export const joinMentorBatch   = (batch, div)    => api("/api/mentor/batches", {
  method: "POST",
  body: JSON.stringify({ batch, division: div }),
});
export const leaveMentorBatch  = (batchId)       => api(`/api/mentor/batches/${batchId}`, {
  method: "DELETE",
});
