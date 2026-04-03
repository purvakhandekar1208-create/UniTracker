// ─── MOCK DATA (replace with real API calls later) ───────────────────────────

// Students
export const MOCK_MENTEES = [
  {
    id: 1,
    name: "Aisha Patil",
    roll: "45",
    division: "A",
    batch: "A1",
    year: "SY",
    phone: "9876543210",
    email: "aisha.patil@dypatil.edu",
    avg_attendance: 85,
    gpa: 8.4,
    cert_count: 5,
    course_count: 2
  },
  {
    id: 2,
    name: "Rohan Desai",
    roll: "12",
    division: "A",
    batch: "A2",
    year: "SY",
    phone: "9876543211",
    email: "rohan.desai@dypatil.edu",
    avg_attendance: 72,
    gpa: 7.1,
    cert_count: 2,
    course_count: 1
  },
  {
    id: 3,
    name: "Priya Sharma",
    roll: "33",
    division: "B",
    batch: "B1",
    year: "SY",
    phone: "9876543212",
    email: "priya.sharma@dypatil.edu",
    avg_attendance: 91,
    gpa: 9.2,
    cert_count: 7,
    course_count: 3
  },
  {
    id: 4,
    name: "Vikram Joshi",
    roll: "8",
    division: "A",
    batch: "A3",
    year: "SY",
    phone: "9876543213",
    email: "vikram.joshi@dypatil.edu",
    avg_attendance: 63,
    gpa: 6.5,
    cert_count: 1,
    course_count: 1
  },
  {
    id: 5,
    name: "Sneha Kulkarni",
    roll: "21",
    division: "B",
    batch: "B2",
    year: "SY",
    phone: "9876543214",
    email: "sneha.kulkarni@dypatil.edu",
    avg_attendance: 88,
    gpa: 8.9,
    cert_count: 4,
    course_count: 2
  },
  {
    id: 6,
    name: "Arjun Mehta",
    roll: "55",
    division: "C",
    batch: "C1",
    year: "SY",
    phone: "9876543215",
    email: "arjun.mehta@dypatil.edu",
    avg_attendance: 79,
    gpa: 7.8,
    cert_count: 3,
    course_count: 2
  }
];


// Mentor selectable batches
export const BATCHES = [
  { id: "A1", division: "A", number: 1, students: 25 },
  { id: "A2", division: "A", number: 2, students: 23 },
  { id: "A3", division: "A", number: 3, students: 22 },

  { id: "B1", division: "B", number: 1, students: 24 },
  { id: "B2", division: "B", number: 2, students: 21 },
  { id: "B3", division: "B", number: 3, students: 20 },

  { id: "C1", division: "C", number: 1, students: 26 },
  { id: "C2", division: "C", number: 2, students: 23 },
  { id: "C3", division: "C", number: 3, students: 22 },

  { id: "D1", division: "D", number: 1, students: 24 },
  { id: "D2", division: "D", number: 2, students: 21 },
  { id: "D3", division: "D", number: 3, students: 20 },

  { id: "E1", division: "E", number: 1, students: 25 },
  { id: "E2", division: "E", number: 2, students: 23 },
  { id: "E3", division: "E", number: 3, students: 22 }
];


// Marks
export const MOCK_MARKS = [
  { subject: "Data Structures", internal: 38, external: 62, total: 100, grade: "O" },
  { subject: "DBMS", internal: 35, external: 58, total: 93, grade: "A+" },
  { subject: "Computer Networks", internal: 30, external: 50, total: 80, grade: "A" },
  { subject: "Operating Systems", internal: 36, external: 60, total: 96, grade: "O" },
  { subject: "Software Engineering", internal: 28, external: 45, total: 73, grade: "B+" }
];


// Certificates
export const MOCK_CERTS = [
  { id: 1, name: "Python Bootcamp", issuer: "Udemy", date: "2024-03-15", type: "Programming" },
  { id: 2, name: "NSS Certificate", issuer: "College", date: "2024-01-20", type: "Activity" },
  { id: 3, name: "AWS Cloud Practitioner", issuer: "Amazon", date: "2023-11-10", type: "Cloud" },
  { id: 4, name: "React Complete Guide", issuer: "Udemy", date: "2023-09-05", type: "Programming" },
  { id: 5, name: "Google UX Design", issuer: "Google", date: "2023-07-22", type: "Design" }
];


// Courses
export const MOCK_COURSES = [
  { id: 1, name: "Machine Learning A-Z", platform: "Udemy", status: "Ongoing", progress: 65 },
  { id: 2, name: "React - The Complete Guide", platform: "Udemy", status: "Completed", progress: 100 },
  { id: 3, name: "DSA Masterclass", platform: "Coursera", status: "Ongoing", progress: 42 }
];


// Attendance
export const ATTENDANCE_DATA = [
  { month: "Jul", present: 22, total: 24 },
  { month: "Aug", present: 19, total: 22 },
  { month: "Sep", present: 20, total: 23 },
  { month: "Oct", present: 18, total: 21 },
  { month: "Nov", present: 21, total: 22 },
  { month: "Dec", present: 16, total: 20 }
];