import { useState, useEffect } from "react";
import { getMenteeMarks } from "../../api/api";

export default function Marks({ readOnly = false, data = null }) {
  const [marks,   setMarks]   = useState(data || []);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) { setMarks(data); return; }
    if (!readOnly) {
      getMenteeMarks()
        .then(setMarks)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  if (loading) return <div className="page-sub">Loading marks...</div>;

  const highest = marks.length ? Math.max(...marks.map((m) => m.total_marks ?? m.total ?? 0)) : "—";
  const lowest  = marks.length ? Math.min(...marks.map((m) => m.total_marks ?? m.total ?? 0)) : "—";

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Academic Marks</div>
          <div className="page-sub">Semester-wise subject marks and grades</div>
        </>
      )}

      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          ["—",            "Current GPA"  ],
          [`${highest}/100`, "Highest Mark"],
          [`${lowest}/100`,  "Lowest Mark" ],
        ].map(([v, l]) => (
          <div className="stat-card" key={l}>
            <div className="stat-value">{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">Subject Marks</div>
          {!readOnly && <button className="btn-red">+ Add Marks</button>}
        </div>
        {marks.length === 0 ? (
          <div className="wcard-body"><div className="page-sub">No marks data found.</div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Internal (40)</th>
                <th>External (60)</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => {
                const grade   = m.grade;
                const subject = m.subject_name ?? m.subject;
                const internal = m.internal_marks ?? m.internal;
                const external = m.external_marks ?? m.external;
                const total    = m.total_marks    ?? m.total;
                return (
                  <tr key={subject}>
                    <td>{subject}</td>
                    <td>{internal}</td>
                    <td>{external}</td>
                    <td><strong>{total}</strong></td>
                    <td>
                      <span className={`badge ${["O", "A+"].includes(grade) ? "badge-green" : "badge-red"}`}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
