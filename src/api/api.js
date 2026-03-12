// ─── API CONFIG ───────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8081";

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
export const saveToken = (token)  => localStorage.setItem("token", token);
export const getToken  = ()       => localStorage.getItem("token");
export const saveUser  = (user)   => localStorage.setItem("user", JSON.stringify(user));
export const getUser   = ()       => JSON.parse(localStorage.getItem("user") || "null");
export const logout    = ()       => { localStorage.removeItem("token"); localStorage.removeItem("user"); };

// ─── BASE FETCH ───────────────────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════

export const login = async (email, password, role) => {
  const data = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  saveToken(data.token);
  saveUser({ userId: data.userId, name: data.name, email: data.email, role: data.role, roll: data.roll, division: data.division, phone: data.phone });
  return data;
};

export const register = async (name, email, password, role, phone, roll, division) => {
  const data = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role, phone, roll, division }),
  });
  saveToken(data.token);
  saveUser({ userId: data.userId, name: data.name, email: data.email, role: data.role, roll: data.roll, division: data.division, phone: data.phone });
  return data;
};

// ═════════════════════════════════════════════════════════════════════════════
// MENTEE APIs
// ═════════════════════════════════════════════════════════════════════════════

export const getMenteeProfile    = () => api("/api/mentee/profile");
export const getMenteeDashboard  = () => api("/api/mentee/dashboard");
export const getMenteeMarks      = () => api("/api/mentee/marks");
export const getMenteeAttendance = () => api("/api/mentee/attendance");
export const getMenteeCourses    = () => api("/api/mentee/courses");
export const getMenteeCerts      = () => api("/api/mentee/certificates");
export const getMenteeRemarks    = () => api("/api/mentee/remarks");

export const addCourse = (courseData) =>
  api("/api/mentee/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
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

// ═════════════════════════════════════════════════════════════════════════════
// MENTOR APIs
// ═════════════════════════════════════════════════════════════════════════════

export const getMentorDashboard       = () => api("/api/mentor/dashboard");
export const getAllMentees            = () => api("/api/mentor/mentees");

export const getMenteeMarksById       = (id) => api(`/api/mentor/mentees/${id}/marks`);
export const getMenteeAttendanceById  = (id) => api(`/api/mentor/mentees/${id}/attendance`);
export const getMenteeCertsById       = (id) => api(`/api/mentor/mentees/${id}/certificates`);
export const getMenteeCoursesById     = (id) => api(`/api/mentor/mentees/${id}/courses`);
export const getMenteeRemarksById     = (id) => api(`/api/mentor/mentees/${id}/remarks`);

export const addRemark = (menteeId, message) =>
  api(`/api/mentor/mentees/${menteeId}/remarks`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
