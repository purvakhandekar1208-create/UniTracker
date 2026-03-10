import { Icons } from "../../assets/Icons";
import { MOCK_CERTS } from "../../api/mockData";

export default function Dashboard({ user }) {
  return (
    <div className="page">
      {/* Stat Cards */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { Icon: Icons.Calendar, value: "85%", label: "Attendance"   },
          { Icon: Icons.Chart,    value: "8.4", label: "Current GPA"  },
          { Icon: Icons.Award,    value: "5",   label: "Uploaded"     },
        ].map(({ Icon, value, label }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-circle"><Icon /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Uploads */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">Recent Uploads List</div>
        </div>
        <ul className="recent-list">
          {MOCK_CERTS.slice(0, 5).map((cert, i) => (
            <li key={cert.id} className="recent-item">
              <div>
                <span className="recent-num">{i + 1}.</span>
                <span className="recent-name">{cert.name}</span>
              </div>
              <button className="btn-view-pdf">View PDF</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Mentor Remarks */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">💬 Mentor Remarks</div>
        </div>
        <div className="wcard-body">
          <div className="remark-card">
            <div className="remark-meta">Dr. Meera Iyer · 5 March 2025</div>
            <div className="remark-text">
              Aisha is performing well overall. Please focus on improving November attendance.
              Keep up the excellent work on certifications.
            </div>
          </div>
          <div className="remark-card">
            <div className="remark-meta">Dr. Meera Iyer · 12 January 2025</div>
            <div className="remark-text">
              Good progress on the ML course. Suggest completing DSA before semester end
              for better exam preparation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
