import { useState, useEffect } from "react";
import { Avatar } from "../../assets/Icons";
import { getAllMentees } from "../../api/api";

export default function MenteesList({ onViewMentee }) {
  const [mentees,   setMentees]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [divFilter, setDivFilter] = useState("All");

  useEffect(() => {
    getAllMentees()
      .then(setMentees)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = mentees.filter(m =>
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
     String(m.roll ?? "").includes(search)) &&
    (divFilter === "All" || (m.division ?? m.div ?? "") === divFilter)
  );

  // Get unique divisions from actual data
  const divisions = ["All", ...new Set(mentees.map(m => m.division ?? m.div).filter(Boolean))];

  if (loading) return <div className="page"><div className="page-sub">Loading mentees...</div></div>;

  return (
    <div className="page">
      <div className="page-heading">All Mentees</div>
      <div className="page-sub">{mentees.length} students assigned</div>

      {/* Search & Filter */}
      <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center", flexWrap:"wrap" }}>
        <input className="form-input" style={{ width:220 }}
          placeholder="Search name or roll no..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {divisions.map(d => (
          <button key={d} onClick={() => setDivFilter(d)} style={{
            padding:"8px 14px", borderRadius:6,
            border:"1.5px solid var(--border)",
            background: divFilter === d ? "var(--red)" : "#fff",
            color: divFilter === d ? "#fff" : "var(--muted)",
            fontSize:13, cursor:"pointer",
            fontWeight: divFilter === d ? 600 : 400,
            transition:"all 0.15s",
          }}>
            {d === "All" ? "All Divisions" : `Division ${d}`}
          </button>
        ))}
      </div>

      <div className="wcard">
        {filtered.length === 0 ? (
          <div className="wcard-body"><div className="page-sub">No mentees found.</div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Division</th>
                <th>Phone</th>
                <th>Attendance</th>
                <th>Certificates</th>
                <th>Courses</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const att = m.avg_attendance ?? 0;
                return (
                  <tr key={m.id} className="tr-click" onClick={() => onViewMentee(m)}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Avatar name={m.name} size={28} />
                        <div>
                          <div>{m.name}</div>
                          <div style={{ fontSize:11, color:"var(--muted)" }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:"var(--muted)" }}>{m.roll ?? "—"}</td>
                    <td>
                      {m.division || m.div
                        ? <span className="badge badge-red">Div {m.division ?? m.div}</span>
                        : "—"}
                    </td>
                    <td style={{ color:"var(--muted)", fontSize:13 }}>{m.phone ?? "—"}</td>
                    <td>
                      <span style={{ color: att < 75 ? "var(--red-mid)" : "#15803d", fontWeight:600 }}>
                        {att}%
                      </span>
                    </td>
                    <td>{m.cert_count ?? "—"}</td>
                    <td>{m.course_count ?? "—"}</td>
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
