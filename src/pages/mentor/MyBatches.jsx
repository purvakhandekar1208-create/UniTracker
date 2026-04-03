import { useState, useMemo } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const DIVISIONS = ["A", "B", "C", "D", "E"];
const BATCH_NUMS = [1, 2, 3];

const ALL_BATCHES = DIVISIONS.flatMap(div =>
  BATCH_NUMS.map(num => ({
    id:    `${div}${num}`,
    div,
    num,
    label: `${div}${num}`,
    full:  `Division ${div} — Batch ${num}`,
  }))
);

// ── Colour palette per division (matches the red‑based theme in the project) ─
const DIV_COLORS = {
  A: { bg: "#fff1f2", accent: "#e11d48", text: "#9f1239" },
  B: { bg: "#fef3c7", accent: "#d97706", text: "#92400e" },
  C: { bg: "#ecfdf5", accent: "#059669", text: "#064e3b" },
  D: { bg: "#eff6ff", accent: "#2563eb", text: "#1e3a8a" },
  E: { bg: "#f5f3ff", accent: "#7c3aed", text: "#3b0764" },
};

// ── Inline styles (no external CSS needed — slots into existing project) ──────
const css = `
  .mb-wrap { padding: 0; }

  .mb-hero {
    background: linear-gradient(135deg, var(--red) 0%, #9f1239 100%);
    border-radius: 14px;
    padding: 28px 32px;
    color: #fff;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .mb-hero-title { font-family: var(--font-head); font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .mb-hero-sub   { font-size: 13px; opacity: 0.8; }
  .mb-hero-pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .mb-hero-pill  {
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    backdrop-filter: blur(4px);
  }

  /* ── My Batches strip ────────────────────────────────────────────────── */
  .mb-selected-section { margin-bottom: 28px; }
  .mb-section-title {
    font-family: var(--font-head);
    font-size: 15px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mb-section-title span {
    background: var(--red);
    color: #fff;
    border-radius: 12px;
    padding: 1px 9px;
    font-size: 12px;
    font-weight: 700;
  }

  .mb-selected-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .mb-selected-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 600;
    border: 1.5px solid;
    transition: all 0.15s;
    animation: chipIn 0.25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes chipIn {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .mb-chip-label { font-size: 13px; font-weight: 700; letter-spacing: 0.05em; }
  .mb-chip-sub   { font-size: 11px; opacity: 0.7; font-weight: 500; }
  .mb-leave-btn  {
    background: rgba(0,0,0,0.08);
    border: none;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    margin-left: 4px;
    letter-spacing: 0.03em;
  }
  .mb-leave-btn:hover { background: rgba(0,0,0,0.18); }

  .mb-empty-state {
    border: 2px dashed var(--border);
    border-radius: 10px;
    padding: 20px 24px;
    color: var(--muted);
    font-size: 13px;
    text-align: center;
  }

  /* ── Available batches ───────────────────────────────────────────────── */
  .mb-filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
    align-items: center;
  }
  .mb-filter-label { font-size: 12px; font-weight: 600; color: var(--muted); margin-right: 2px; }
  .mb-filter-btn   {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1.5px solid var(--border);
    background: #fff;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.03em;
  }
  .mb-filter-btn.active {
    border-color: var(--red);
    background: var(--red);
    color: #fff;
  }
  .mb-filter-btn:hover:not(.active) { border-color: var(--red); color: var(--red); }

  /* Division group */
  .mb-div-group { margin-bottom: 22px; }
  .mb-div-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .mb-div-badge {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; flex-shrink: 0;
  }
  .mb-div-name { font-size: 14px; font-weight: 700; color: var(--dark); }
  .mb-div-meta { font-size: 12px; color: var(--muted); }

  .mb-batch-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .mb-batch-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    padding: 14px 18px;
    background: #fff;
    min-width: 130px;
    transition: box-shadow 0.15s, border-color 0.15s;
    position: relative;
    overflow: hidden;
  }
  .mb-batch-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 3px 0 0 3px;
  }
  .mb-batch-card:hover:not(.joined) {
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }
  .mb-batch-card.joined {
    opacity: 0.55;
    pointer-events: none;
  }
  .mb-batch-id   { font-size: 20px; font-weight: 800; font-family: var(--font-head); }
  .mb-batch-desc { font-size: 11px; color: var(--muted); }
  .mb-join-btn   {
    align-self: flex-start;
    margin-top: 4px;
    padding: 5px 14px;
    border-radius: 6px;
    border: 1.5px solid;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.03em;
  }
  .mb-join-btn:hover { filter: brightness(0.92); }
  .mb-joined-tag {
    align-self: flex-start;
    margin-top: 4px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: #dcfce7;
    color: #15803d;
  }
`;

export default function MyBatches({ myBatches = [], setMyBatches, onNavigate }) {

  const [divFilter, setDivFilter] = useState("All");

  const joinedIds = useMemo(() => new Set(myBatches.map(b => b.id)), [myBatches]);

  const joinBatch = (batch) => {

    if (!joinedIds.has(batch.id)) {
      setMyBatches(prev => [...prev, batch]);
    }

    // ⭐ navigate to mentees page and filter by batch
    if (onNavigate) {
      onNavigate("mentees", batch.id);
    }
  };

  const leaveBatch = (batchId) => {
    setMyBatches(prev => prev.filter(b => b.id !== batchId));
  };

  const visibleGroups = DIVISIONS
    .filter(div => divFilter === "All" || divFilter === div)
    .map(div => ({
      div,
      batches: ALL_BATCHES.filter(b => b.div === div),
      colors: DIV_COLORS[div],
    }));

  return (
    <>
      <style>{css}</style>

      <div className="page mb-wrap">

        {/* Hero banner */}
        <div className="mb-hero">
          <div>
            <div className="mb-hero-title">📋 My Batches</div>
            <div className="mb-hero-sub">
              Join batches to manage your mentees · {myBatches.length} batch{myBatches.length !== 1 ? "es" : ""} selected
            </div>
          </div>

          <div className="mb-hero-pills">
            {myBatches.length === 0
              ? <div className="mb-hero-pill">No batches joined yet</div>
              : myBatches.map(b => (
                  <div className="mb-hero-pill" key={b.id}>{b.label}</div>
                ))
            }
          </div>
        </div>


        {/* Selected Batches */}
        <div className="mb-selected-section">

          <div className="mb-section-title">
            My Batches
            {myBatches.length > 0 && <span>{myBatches.length}</span>}
          </div>

          {myBatches.length === 0 ? (

            <div className="mb-empty-state">
              You haven't joined any batches yet. Pick from the list below ↓
            </div>

          ) : (

            <div className="mb-selected-grid">

              {myBatches.map(b => {

                const c = DIV_COLORS[b.div];

                return (

                  <div
                    key={b.id}
                    className="mb-selected-chip"
                    style={{
                      background: c.bg,
                      borderColor: c.accent,
                      color: c.text
                    }}
                  >

                    <div>
                      <div className="mb-chip-label">{b.label}</div>
                      <div className="mb-chip-sub">{b.full}</div>
                    </div>

                    <button
                      className="mb-leave-btn"
                      onClick={() => leaveBatch(b.id)}
                      title={`Leave ${b.label}`}
                      style={{ color: c.text }}
                    >
                      Leave ✕
                    </button>

                  </div>

                );

              })}

            </div>

          )}

        </div>


        {/* Available Batches */}
        <div className="wcard">

          <div className="wcard-head">
            <div className="wcard-title">Available Batches</div>
          </div>

          <div className="wcard-body">


            {/* Division Filter */}
            <div className="mb-filter-bar">

              <span className="mb-filter-label">Filter:</span>

              {["All", ...DIVISIONS].map(d => (

                <button
                  key={d}
                  className={`mb-filter-btn ${divFilter === d ? "active" : ""}`}
                  onClick={() => setDivFilter(d)}
                >
                  {d === "All" ? "All Divisions" : `Division ${d}`}
                </button>

              ))}

            </div>


            {/* Batch Cards */}
            {visibleGroups.map(({ div, batches, colors }) => (

              <div className="mb-div-group" key={div}>

                <div className="mb-div-header">

                  <div
                    className="mb-div-badge"
                    style={{
                      background: colors.bg,
                      color: colors.accent
                    }}
                  >
                    {div}
                  </div>

                  <div>
                    <div className="mb-div-name">Division {div}</div>
                    <div className="mb-div-meta">3 batches available</div>
                  </div>

                </div>


                <div className="mb-batch-row">

                  {batches.map(batch => {

                    const isJoined = joinedIds.has(batch.id);

                    return (

                      <div
                        key={batch.id}
                        className={`mb-batch-card ${isJoined ? "joined" : ""}`}
                      >

                        <div
                          className="mb-batch-id"
                          style={{ color: colors.accent }}
                        >
                          {batch.label}
                        </div>

                        <div className="mb-batch-desc">
                          {batch.full}
                        </div>

                        {isJoined ? (

                          <div className="mb-joined-tag">
                            ✓ Joined
                          </div>

                        ) : (

                          <button
                            className="mb-join-btn"
                            style={{
                              borderColor: colors.accent,
                              background: colors.bg,
                              color: colors.accent
                            }}
                            onClick={() => joinBatch(batch)}
                          >
                            + Join
                          </button>

                        )}

                      </div>

                    );

                  })}

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </>
  );
}