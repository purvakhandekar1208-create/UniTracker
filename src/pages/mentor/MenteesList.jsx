import { useState } from "react";
import { Avatar } from "../../assets/Icons";
import { MOCK_MENTEES, BATCHES } from "../../api/mockData";

export default function MenteesList({ onViewMentee }) {
  const [search, setSearch]   = useState("");
  const [divFilter, setDiv]   = useState("All");

  const filtered = MOCK_MENTEES.filter(
    (m) =>
      (m.name.toLowerCase().includes(search.toLowerCase()) || m.roll.includes(search)) &&
      (divFilter === "All" || m.div === divFilter)
  );

  return (
    <div className="page">
      <div className="page-heading">All Mentees</div>
      <div className="page-sub">Batch 2021-25 · {MOCK_MENTEES.length} students assigned</div>

      {/* Batch info cards */}
      <div className="batch-grid" style={{ marginBottom: 24 }}>
        {BATCHES.map((b) => (
          <div className="batch-card" key={b.id}>
            <div className="batch-dot" />
            <div className="batch-name">{b.name}</div>
            <div className="batch-meta">Division: {b.div} | Batch: {b.batch}</div>
            <div className="batch-meta">Total Students: {b.students}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <input
          className="form-input"
          style={{ width: 220 }}
          placeholder="Search name or roll no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {["All", "A", "B"].map((d) => (
          <button
            key={d}
            onClick={() => setDiv(d)}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1.5px solid var(--border)",
              background: divFilter === d ? "var(--red)" : "#fff",
              color: divFilter === d ? "#fff" : "var(--muted)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: divFilter === d ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {d === "All" ? "All Divisions" : `Division ${d}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="wcard">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Division</th>
              <th>Attendance</th>
              <th>GPA</th>
              <th>Certificates</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="tr-click" onClick={() => onViewMentee(m)}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={m.name} size={28} />
                    {m.name}
                  </div>
                </td>
                <td style={{ color: "var(--muted)" }}>{m.roll}</td>
                <td><span className="badge badge-red">Div {m.div}</span></td>
                <td>
                  <span style={{ color: m.attendance < 75 ? "var(--red-mid)" : "#15803d", fontWeight: 600 }}>
                    {m.attendance}%
                  </span>
                </td>
                <td>{m.gpa}</td>
                <td>{m.certs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
