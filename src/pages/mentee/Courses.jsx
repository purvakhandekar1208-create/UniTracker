import { useState } from "react";
import { MOCK_COURSES } from "../../api/mockData";

// readOnly = true  → mentor view inside MenteeDetail
// readOnly = false → mentee's own page
export default function Courses({ readOnly = false }) {
  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Enrolled Courses</div>
          <div className="page-sub">Track your learning progress</div>

          {/* Add course form */}
          <div className="wcard" style={{ marginBottom: 20 }}>
            <div className="wcard-head">
              <div className="wcard-title">Add New Course</div>
            </div>
            <div className="wcard-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Course Name</label>
                  <input className="form-input" placeholder="e.g. Deep Learning Specialization" />
                </div>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-select">
                    <option>Coursera</option>
                    <option>Udemy</option>
                    <option>edX</option>
                    <option>NPTEL</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select">
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Enrollment Date</label>
                  <input className="form-input" type="date" />
                </div>
              </div>
              <button className="btn-red">Add Course</button>
            </div>
          </div>
        </>
      )}

      {/* Course cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_COURSES.map((course) => (
          <div className="wcard" key={course.id} style={{ marginBottom: 0 }}>
            <div className="wcard-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28 }}>
                {course.status === "Completed" ? "✅" : "📖"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{course.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{course.platform}</div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "var(--muted)" }}>
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-bar" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </div>
              <span className={`badge ${course.status === "Completed" ? "badge-green" : "badge-red"}`}>
                {course.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
