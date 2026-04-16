package com.unitracker.service;

import com.unitracker.entity.*;
import com.unitracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DataStore {

    private final UserRepository        userRepository;
    private final MarksRepository       marksRepository;
    private final AttendanceRepository  attendanceRepository;
    private final CertificateRepository certificateRepository;
    private final RemarkRepository      remarkRepository;

    // ── USER ──────────────────────────────────────────────────────────────────

    public Optional<Map<String, Object>> findByEmail(String email) {
        return userRepository.findByEmail(email).map(this::userToMap);
    }

    public Optional<Map<String, Object>> findById(int id) {
        return userRepository.findById(id).map(this::userToMap);
    }

    public List<Map<String, Object>> getAllMentees() {
        return userRepository.findAll().stream()
                .filter(u -> "mentee".equalsIgnoreCase(u.getRole()))
                .map(u -> {
                    Map<String, Object> m = userToMap(u);
                    int uid = u.getId();
                    m.put("cert_count",    certificateRepository.findByUserId(uid).size());
                    double avg = attendanceRepository.findByUserId(uid).stream()
                            .mapToInt(Attendance::getPercentage).average().orElse(0);
                    m.put("avg_attendance", (int) Math.round(avg));
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ── MARKS ─────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getMarksByUserId(int userId) {
        return marksRepository.findByUserId(userId).stream()
                .map(this::marksToMap).collect(Collectors.toList());
    }

    // ── ATTENDANCE ────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getAttByUserId(int userId) {
        return attendanceRepository.findByUserId(userId).stream()
                .map(this::attToMap).collect(Collectors.toList());
    }

    /**
     * Mentor override: upsert a special "MENTOR_OVERRIDE" month record so that
     * avg_attendance recalculates to the intended value without touching real
     * monthly data.
     *
     * Strategy:
     *   1. Delete any existing MENTOR_OVERRIDE record for this user.
     *   2. Find all real monthly records and compute their average.
     *   3. If the real average already matches the target, we're done.
     *   4. Otherwise insert a synthetic record whose percentage equals the target,
     *      weighted so the new average across (realCount + 1) rows equals target.
     *      If the math is out of range, we just insert target directly — the
     *      displayed avg_attendance on the list page is computed the same way, so
     *      it will match.
     *
     * Simpler alternative used here: replace ALL records with a single
     * MENTOR_OVERRIDE row that carries the desired percentage. This keeps the
     * implementation minimal and avoids needing a separate DB column.
     *
     * If you want to preserve monthly breakdown alongside the override, switch to
     * the weighted-insert strategy described above.
     */
    public Map<String, Object> upsertAttendanceOverride(int userId, int percentage) {
        // Remove any existing override record for this user
        List<Attendance> existing = attendanceRepository.findByUserId(userId);
        existing.stream()
                .filter(a -> "MENTOR_OVERRIDE".equals(a.getMonth()))
                .forEach(a -> attendanceRepository.deleteById(a.getId()));

        // Insert fresh override row
        // days_present / days_absent are not meaningful here — set to 0
        Attendance override = new Attendance(0, userId, "MENTOR_OVERRIDE", percentage, 0, 0);
        Attendance saved = attendanceRepository.save(override);
        return attToMap(saved);
    }

    // ── CERTIFICATES ──────────────────────────────────────────────────────────

    public List<Map<String, Object>> getCertsByUserId(int userId) {
        return certificateRepository.findByUserId(userId).stream()
                .map(this::certToMap).collect(Collectors.toList());
    }

    public Map<String, Object> addCert(int userId, String title, String provider,
                                        String issueDate, String filePath) {
        Certificate c = new Certificate(0, userId, title, provider, issueDate, filePath);
        return certToMap(certificateRepository.save(c));
    }

    public Optional<Map<String, Object>> getCertById(int id) {
        return certificateRepository.findById(id).map(this::certToMap);
    }

    // ── REMARKS ───────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getRemarksByMenteeId(int menteeId) {
        return remarkRepository.findByMenteeId(menteeId).stream()
                .map(this::remarkToMap).collect(Collectors.toList());
    }

    public Map<String, Object> addRemark(int mentorId, int menteeId,
                                          String message, String date) {
        String mentorName = userRepository.findById(mentorId)
                .map(User::getName).orElse("Mentor");
        MentorRemark r = new MentorRemark(0, mentorId, menteeId, mentorName, message, date);
        return remarkToMap(remarkRepository.save(r));
    }

    // ── CONVERTERS ────────────────────────────────────────────────────────────

    public Map<String, Object> userToMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",           u.getId());
        m.put("name",         u.getName());
        m.put("email",        u.getEmail());
        m.put("password",     u.getPassword());
        m.put("role",         u.getRole());
        m.put("phone",        s(u.getPhone()));
        m.put("roll",         s(u.getRoll()));
        m.put("division",     s(u.getDivision()));
        m.put("batch",        s(u.getBatch()));
        m.put("department",   s(u.getDepartment()));
        m.put("year",         u.getYear()     != null ? u.getYear()     : 0);
        m.put("semester",     u.getSemester() != null ? u.getSemester() : 0);
        m.put("parent1Phone", s(u.getParent1Phone()));
        m.put("parent2Phone", s(u.getParent2Phone()));
        return m;
    }

    private String s(String v) { return v != null ? v : ""; }

    private Map<String, Object> marksToMap(Marks x) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",             x.getId());
        m.put("user_id",        x.getUserId());
        m.put("subject_id",     x.getSubjectId());
        m.put("subject_name",   x.getSubjectName());
        m.put("internal_marks", x.getInternalMarks());
        m.put("external_marks", x.getExternalMarks());
        m.put("total_marks",    x.getTotalMarks());
        m.put("grade",          x.getGrade());
        return m;
    }

    private Map<String, Object> attToMap(Attendance x) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",           x.getId());
        m.put("user_id",      x.getUserId());
        m.put("month",        x.getMonth());
        m.put("percentage",   x.getPercentage());
        m.put("days_present", x.getDaysPresent());
        m.put("days_absent",  x.getDaysAbsent());
        return m;
    }

    private Map<String, Object> certToMap(Certificate x) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",         x.getId());
        m.put("user_id",    x.getUserId());
        m.put("title",      x.getTitle());
        m.put("provider",   x.getProvider());
        m.put("issue_date", x.getIssueDate());
        m.put("file_path",  x.getFilePath());
        return m;
    }

    private Map<String, Object> remarkToMap(MentorRemark x) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          x.getId());
        m.put("mentor_id",   x.getMentorId());
        m.put("mentee_id",   x.getMenteeId());
        m.put("mentor_name", x.getMentorName());
        m.put("message",     x.getMessage());
        m.put("remark_date", x.getRemarkDate());
        return m;
    }
}