import { useState, useEffect } from "react";
import { getMenteeCourses, addCourse } from "../../api/api";

export default function Courses({ readOnly = false, data = null }) {
  const [courses,  setCourses]  = useState(data || []);
  const [loading,  setLoading]  = useState(!data);
  const [adding,   setAdding]   = useState(false);
  const [form, setForm] = useState({
    course_name: "", provider: "", status: "Ongoing", progress: 0,
  });

  useEffect(() => {
    if (data) { setCourses(data); return; }
    if (!readOnly) {
      getMenteeCourses()
        .then(setCourses)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  const handleAdd = async () => {
    if (!form.course_name) { alert("Please enter a course name."); return; }
    setAdding(true);
    try {
      const newCourse = await addCourse(form);
      setCourses((prev) => [...prev, newCourse]);
      setForm({ course_name: "", provider: "", status: "Ongoing", progress: 0 });
    } catch (e) {
      alert("Failed to add course: " + e.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="page-sub">Loading courses...</div>;

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Enrolled Courses</div>
          <div className="page-sub">Track your learning progress</div>

          <div className="wcard" style={{ marginBottom: 20 }}>
            <div className="wcard-head"><div className="wcard-title">Add New Course</div></div>
            <div className="wcard-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Course Name</label>
                  <input className="form-input" placeholder="e.g. Deep Learning Specialization"
                    value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-select" value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                    <option>Coursera</option>
                    <option>Udemy</option>
                    <option>edX</option>
                    <option>NPTEL</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Progress (%)</label>
                  <input className="form-input" type="number" min="0" max="100"
                    value={form.progress} onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <button className="btn-red" onClick={handleAdd} disabled={adding}>
                {adding ? "Adding..." : "Add Course"}
              </button>
            </div>
          </div>
        </>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {courses.length === 0 ? (
          <div className="page-sub">No courses added yet.</div>
        ) : (
          courses.map((course) => (
            <div className="wcard" key={course.id} style={{ marginBottom: 0 }}>
              <div className="wcard-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 28 }}>
                  {course.status === "Completed" ? "✅" : "📖"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>
                    {course.course_name ?? course.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{course.provider ?? course.platform}</div>
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
          ))
        )}
      </div>
    </div>
  );
}
