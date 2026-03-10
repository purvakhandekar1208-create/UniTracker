import { MOCK_MARKS } from "../../api/mockData";

// readOnly = true  → shown inside MenteeDetail (mentor view)
// readOnly = false → shown as standalone page (mentee view)
export default function Marks({ readOnly = false }) {
  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Academic Marks</div>
          <div className="page-sub">Semester-wise subject marks and grades</div>
        </>
      )}

      {/* Summary stats */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          ["8.4",    "Current GPA"   ],
          ["100/100","Highest Mark"  ],
          ["73/100", "Lowest Mark"   ],
        ].map(([v, l]) => (
          <div className="stat-card" key={l}>
            <div className="stat-value">{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Marks table */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">Semester IV — Subject Marks</div>
          {!readOnly && (
            <button className="btn-red">+ Add Marks</button>
          )}
        </div>
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
            {MOCK_MARKS.map((m) => (
              <tr key={m.subject}>
                <td>{m.subject}</td>
                <td>{m.internal}</td>
                <td>{m.external}</td>
                <td><strong>{m.total}</strong></td>
                <td>
                  <span className={`badge ${["O", "A+"].includes(m.grade) ? "badge-green" : "badge-red"}`}>
                    {m.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
