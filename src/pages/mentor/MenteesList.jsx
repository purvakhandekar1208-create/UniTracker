import { useState, useEffect } from "react";
import { Avatar } from "../../assets/Icons";
import { getAllMentees, updateMenteeAttendance } from "../../api/api";

export default function MenteesList({ onViewMentee, myBatches = [] }) {

  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [divFilter, setDivFilter] = useState("All");

  // { [menteeId]: number | "" }  — live typed values
  const [attEdits, setAttEdits] = useState({});
  // { [menteeId]: "saving" | "saved" | "error" }
  const [attStatus, setAttStatus] = useState({});

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

  // Edited value takes priority over the fetched avg_attendance
  const getAtt = (m) =>
    attEdits[m.id] !== undefined ? attEdits[m.id] : (m.avg_attendance ?? 0);

  const handleAttChange = (e, menteeId) => {
    const raw = e.target.value;
    if (raw === "") {
      setAttEdits(prev => ({ ...prev, [menteeId]: "" }));
      return;
    }
    const num = Math.min(100, Math.max(0, Number(raw)));
    if (isNaN(num)) return;
    setAttEdits(prev => ({ ...prev, [menteeId]: num }));
  };

  // On blur: if empty → reset; otherwise POST to backend and update state
  const handleAttBlur = async (menteeId) => {
    let val = attEdits[menteeId];

    if (val === "" || val === undefined) {
      const stored = mentees.find(m => m.id === menteeId)?.avg_attendance ?? 0;
      setAttEdits(prev => ({ ...prev, [menteeId]: stored }));
      return;
    }

    val = Number(val);
    setAttStatus(prev => ({ ...prev, [menteeId]: "saving" }));

    try {
      await updateMenteeAttendance(menteeId, val);

      // Patch avg_attendance so dashboard / Needs Attention picks up the change
      setMentees(prev =>
        prev.map(m => m.id === menteeId ? { ...m, avg_attendance: val } : m)
      );

      setAttStatus(prev => ({ ...prev, [menteeId]: "saved" }));
      setTimeout(() => {
        setAttStatus(prev => {
          const next = { ...prev };
          delete next[menteeId];
          return next;
        });
      }, 2000);

    } catch (err) {
      console.error("Failed to save attendance:", err);
      setAttStatus(prev => ({ ...prev, [menteeId]: "error" }));
    }
  };

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
                    <th>Attendance</th>
                    <th>Certificates</th>
                    <th>Courses</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(m => {
                    const att    = getAtt(m);
                    const attNum = att === "" ? 0 : Number(att);
                    const isLow  = attNum < 75;
                    const status = attStatus[m.id];

                    return (
                      <tr
                        key={m.id}
                        className="tr-click"
                        onClick={() => onViewMentee({ ...m, avg_attendance: attNum })}
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
                          {m.phone ?? "—"}
                        </td>

                        {/* ── Editable Attendance Cell ── */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={att}
                              onChange={(e) => handleAttChange(e, m.id)}
                              onBlur={() => handleAttBlur(m.id)}
                              disabled={status === "saving"}
                              style={{
                                width: 54,
                                padding: "3px 6px",
                                borderRadius: 5,
                                border: `1.5px solid ${isLow ? "var(--red-mid, #ef4444)" : "var(--border)"}`,
                                fontSize: 13,
                                fontWeight: 600,
                                color: isLow ? "var(--red-mid, #ef4444)" : "#15803d",
                                textAlign: "center",
                                outline: "none",
                                background: isLow
                                  ? "rgba(239,68,68,0.06)"
                                  : "rgba(21,128,61,0.06)",
                                MozAppearance: "textfield",
                                opacity: status === "saving" ? 0.6 : 1,
                              }}
                            />
                            <span style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: isLow ? "var(--red-mid, #ef4444)" : "#15803d"
                            }}>
                              %
                            </span>

                            {/* Inline save status indicator */}
                            {status === "saving" && (
                              <span style={{ fontSize: 10, color: "var(--muted)" }}>···</span>
                            )}
                            {status === "saved" && (
                              <span style={{ fontSize: 11, color: "#15803d" }} title="Saved">✓</span>
                            )}
                            {status === "error" && (
                              <span style={{ fontSize: 11, color: "var(--red-mid, #ef4444)" }} title="Save failed — try again">✕</span>
                            )}
                          </div>
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
        </>
      )}

    </div>
  );
}