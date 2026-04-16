import { useState, useEffect } from "react";
import { Avatar } from "../../assets/Icons";
import { getAllMentees } from "../../api/api";

export default function MenteesList({ onViewMentee, myBatches = [] }) {

  const [mentees,  setMentees]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [divFilter, setDivFilter] = useState("All");

  useEffect(() => {
    getAllMentees()
      .then(setMentees)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const mentorBatchIds = myBatches.map(b => b.id);

  const menteesForMentor =
    mentorBatchIds.length === 0
      ? []
      : mentees.filter(m => mentorBatchIds.includes(m.batch));

  const filtered = menteesForMentor.filter(m =>
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
      String(m.roll ?? "").includes(search)) &&
    (divFilter === "All" || (m.division ?? m.div ?? "") === divFilter)
  );

  const divisions = [
    "All",
    ...new Set(
      menteesForMentor.map(m => m.division ?? m.div).filter(Boolean)
    )
  ];

  if (loading) {
    return (
      <div className="page">
        <div className="page-sub">Loading mentees...</div>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="page-heading">All Mentees</div>

      <div className="page-sub">
        {myBatches.length === 0
          ? "Join a batch to view mentees."
          : `${filtered.length} students in your batches`}
      </div>

      {myBatches.length === 0 && (
        <div className="wcard" style={{ marginTop: 20 }}>
          <div className="wcard-body">
            <div className="page-sub">
              You haven't joined any batches yet.
              Please go to <b>My Batches</b> and select a batch.
            </div>
          </div>
        </div>
      )}

      {myBatches.length > 0 && (
        <>
          {/* Search + Division Filter */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <input
              className="form-input"
              style={{ width: 220 }}
              placeholder="Search name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {divisions.map(d => (
              <button
                key={d}
                onClick={() => setDivFilter(d)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 6,
                  border: "1.5px solid var(--border)",
                  background: divFilter === d ? "var(--red)" : "#fff",
                  color: divFilter === d ? "#fff" : "var(--muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: divFilter === d ? 600 : 400,
                  transition: "all 0.15s"
                }}
              >
                {d === "All" ? "All Divisions" : `Division ${d}`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="wcard">
            {filtered.length === 0 ? (
              <div className="wcard-body">
                <div className="page-sub">
                  No mentees found in your selected batches.
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Division</th>
                    <th>Batch</th>
                    <th>Phone</th>
                    <th>Parent 1 Phone</th>
                    <th>Parent 1 Email</th>
                    <th>Attendance</th>
                    <th>Certificates</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(m => {
                    const att    = m.avg_attendance ?? 0;
                    const isLow  = att < 75;

                    return (
                      <tr
                        key={m.id}
                        className="tr-click"
                        onClick={() => onViewMentee(m)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={m.name} size={28} />
                            <div>
                              <div>{m.name}</div>
                              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                                {m.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ color: "var(--muted)" }}>
                          {m.roll ?? "—"}
                        </td>

                        <td>
                          {m.division || m.div ? (
                            <span className="badge badge-red">
                              Div {m.division ?? m.div}
                            </span>
                          ) : "—"}
                        </td>

                        <td>
                          {m.batch ? (
                            <span className="badge">{m.batch}</span>
                          ) : "—"}
                        </td>

                        <td style={{ color: "var(--muted)", fontSize: 13 }}>
                          {m.phone || "—"}
                        </td>

                        <td style={{ color: "var(--muted)", fontSize: 13 }}>
                          {m.parent1Phone || m.parent1_phone || "—"}
                        </td>

                        <td style={{ color: "var(--muted)", fontSize: 13 }}>
                          {m.parent1Email || m.parent1_email || "—"}
                        </td>

                        {/* Attendance % badge */}
                        <td>
                          <span style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            background: isLow ? "rgba(239,68,68,0.1)" : "rgba(21,128,61,0.08)",
                            color: isLow ? "var(--red-mid, #ef4444)" : "#15803d",
                            border: `1.5px solid ${isLow ? "var(--red-mid, #ef4444)" : "#86efac"}`
                          }}>
                            {att}%
                          </span>
                        </td>

                        <td>{m.cert_count ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

    </div>
  );
}