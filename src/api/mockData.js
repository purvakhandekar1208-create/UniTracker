// ─── MOCK DATA (replace with real API calls later) ───────────────────────────

export const MOCK_MENTEES = [
  { id: 1, name: "Aisha Patil",    roll: "45", div: "A", batch: "B.Tech - Computer Engineering", year: "SY", phone: "9876543210", email: "aisha.patil@dypatil.edu",    attendance: 85, gpa: 8.4, certs: 5 },
  { id: 2, name: "Rohan Desai",    roll: "12", div: "A", batch: "B.Tech - Computer Engineering", year: "SY", phone: "9876543211", email: "rohan.desai@dypatil.edu",    attendance: 72, gpa: 7.1, certs: 2 },
  { id: 3, name: "Priya Sharma",   roll: "33", div: "B", batch: "B.Tech - Computer Engineering", year: "SY", phone: "9876543212", email: "priya.sharma@dypatil.edu",   attendance: 91, gpa: 9.2, certs: 7 },
  { id: 4, name: "Vikram Joshi",   roll: "8",  div: "A", batch: "B.Tech - Computer Engineering", year: "SY", phone: "9876543213", email: "vikram.joshi@dypatil.edu",   attendance: 63, gpa: 6.5, certs: 1 },
  { id: 5, name: "Sneha Kulkarni", roll: "21", div: "B", batch: "B.Tech - Computer Engineering", year: "SY", phone: "9876543214", email: "sneha.kulkarni@dypatil.edu", attendance: 88, gpa: 8.9, certs: 4 },
  { id: 6, name: "Arjun Mehta",    roll: "55", div: "A", batch: "B.Tech - Computer Engineering", year: "SY", phone: "9876543215", email: "arjun.mehta@dypatil.edu",    attendance: 79, gpa: 7.8, certs: 3 },
];

export const BATCHES = [
  { id: 1, name: "B.Tech - Computer Engineering", div: "A", batch: 1, students: 25 },
  { id: 2, name: "B.Tech - Computer Engineering", div: "B", batch: 2, students: 22 },
];

export const MOCK_MARKS = [
  { subject: "Data Structures",      internal: 38, external: 62, total: 100, grade: "O"  },
  { subject: "DBMS",                 internal: 35, external: 58, total: 93,  grade: "A+" },
  { subject: "Computer Networks",    internal: 30, external: 50, total: 80,  grade: "A"  },
  { subject: "Operating Systems",    internal: 36, external: 60, total: 96,  grade: "O"  },
  { subject: "Software Engineering", internal: 28, external: 45, total: 73,  grade: "B+" },
];

export const MOCK_CERTS = [
  { id: 1, name: "Python Bootcamp",        issuer: "Udemy",   date: "2024-03-15", type: "Programming" },
  { id: 2, name: "NSS Certificate",        issuer: "College", date: "2024-01-20", type: "Activity"    },
  { id: 3, name: "AWS Cloud Practitioner", issuer: "Amazon",  date: "2023-11-10", type: "Cloud"       },
  { id: 4, name: "React Complete Guide",   issuer: "Udemy",   date: "2023-09-05", type: "Programming" },
  { id: 5, name: "Google UX Design",       issuer: "Google",  date: "2023-07-22", type: "Design"      },
];

export const MOCK_COURSES = [
  { id: 1, name: "Machine Learning A-Z",       platform: "Udemy",    status: "Ongoing",   progress: 65  },
  { id: 2, name: "React - The Complete Guide", platform: "Udemy",    status: "Completed", progress: 100 },
  { id: 3, name: "DSA Masterclass",            platform: "Coursera", status: "Ongoing",   progress: 42  },
];

export const ATTENDANCE_DATA = [
  { month: "Jul", present: 22, total: 24 },
  { month: "Aug", present: 19, total: 22 },
  { month: "Sep", present: 20, total: 23 },
  { month: "Oct", present: 18, total: 21 },
  { month: "Nov", present: 21, total: 22 },
  { month: "Dec", present: 16, total: 20 },
];
