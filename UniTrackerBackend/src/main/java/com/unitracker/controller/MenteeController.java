package com.unitracker.controller;

import com.unitracker.entity.User;
import com.unitracker.repository.MentorBatchRepository;
import com.unitracker.repository.UserRepository;
import com.unitracker.service.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/mentee")
@RequiredArgsConstructor
public class MenteeController {

    private final DataStore             dataStore;
    private final UserRepository        userRepository;
    private final MentorBatchRepository mentorBatchRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private int    uid(HttpServletRequest r)   { return (int)    r.getAttribute("userId"); }
    private String uname(HttpServletRequest r) { return (String) r.getAttribute("userName"); }
    private String urole(HttpServletRequest r) { return (String) r.getAttribute("userRole"); }

    // ── PROFILE ──────────────────────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(HttpServletRequest r) {
        return dataStore.findById(uid(r)).map(u -> {
            Map<String, Object> safe = new LinkedHashMap<>(u);
            safe.remove("password");
            return ResponseEntity.ok(safe);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── UPDATE PROFILE ────────────────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(HttpServletRequest r,
                                            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(uid(r)).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        if (body.containsKey("phone"))        user.setPhone(body.get("phone"));
        if (body.containsKey("parent1Phone")) user.setParent1Phone(body.get("parent1Phone"));
        if (body.containsKey("parent2Phone")) user.setParent2Phone(body.get("parent2Phone"));
        if (body.containsKey("parent1Email")) user.setParent1Email(body.get("parent1Email"));
        if (body.containsKey("parent2Email")) user.setParent2Email(body.get("parent2Email"));
        if (body.containsKey("roll"))         user.setRoll(body.get("roll"));
        if (body.containsKey("division"))     user.setDivision(body.get("division"));
        if (body.containsKey("batch"))        user.setBatch(body.get("batch"));
        if (body.containsKey("department"))   user.setDepartment(body.get("department"));
        if (body.containsKey("year"))     { try { user.setYear(Integer.parseInt(body.get("year")));     } catch (Exception ignored) {} }
        if (body.containsKey("semester")) { try { user.setSemester(Integer.parseInt(body.get("semester"))); } catch (Exception ignored) {} }

        User saved = userRepository.save(user);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",           saved.getId());
        resp.put("name",         saved.getName());
        resp.put("email",        saved.getEmail());
        resp.put("role",         saved.getRole());
        resp.put("phone",        safe(saved.getPhone()));
        resp.put("roll",         safe(saved.getRoll()));
        resp.put("division",     safe(saved.getDivision()));
        resp.put("batch",        safe(saved.getBatch()));
        resp.put("department",   safe(saved.getDepartment()));
        resp.put("year",         saved.getYear()     != null ? saved.getYear()     : 0);
        resp.put("semester",     saved.getSemester() != null ? saved.getSemester() : 0);
        resp.put("parent1Phone", safe(saved.getParent1Phone()));
        resp.put("parent2Phone", safe(saved.getParent2Phone()));
        resp.put("parent1Email", safe(saved.getParent1Email()));
        resp.put("parent2Email", safe(saved.getParent2Email()));
        return ResponseEntity.ok(resp);
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(HttpServletRequest r) {
        int    id   = uid(r);
        String name = uname(r);

        User user = userRepository.findById(id).orElse(null);

        double avg = dataStore.getAttByUserId(id).stream()
                .mapToInt(a -> (int) a.get("percentage"))
                .average().orElse(0);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("name",              name);
        resp.put("avg_attendance",    (int) Math.round(avg));
        resp.put("certificate_count", dataStore.getCertsByUserId(id).size());
        resp.put("remarks",           dataStore.getRemarksByMenteeId(id));
        resp.put("certificates",      dataStore.getCertsByUserId(id));

        if (user != null) {
            resp.put("department",   safe(user.getDepartment()));
            resp.put("batch",        safe(user.getBatch()));
            resp.put("year",         user.getYear()     != null ? user.getYear()     : 0);
            resp.put("semester",     user.getSemester() != null ? user.getSemester() : 0);
            resp.put("division",     safe(user.getDivision()));
            resp.put("roll",         safe(user.getRoll()));
            resp.put("phone",        safe(user.getPhone()));
            resp.put("parent1Phone", safe(user.getParent1Phone()));
            resp.put("parent2Phone", safe(user.getParent2Phone()));

            // Latest CGPA from sgpa_records
            Double cgpa = dataStore.getLatestCgpa(id);
            resp.put("cgpa", cgpa);

            // ── Assigned Mentor via mentor_batches table ──────────────────────
            // Look up which mentor is assigned to the mentee's batch in the DB.
            String menteeBatch = user.getBatch();
            if (menteeBatch != null && !menteeBatch.isBlank()) {
                mentorBatchRepository.findByBatch(menteeBatch)
                    .stream()
                    .findFirst()
                    .flatMap(mb -> userRepository.findById(mb.getMentorId()))
                    .ifPresent(mentor -> {
                        Map<String, Object> mentorInfo = new LinkedHashMap<>();
                        mentorInfo.put("id",    mentor.getId());
                        mentorInfo.put("name",  safe(mentor.getName()));
                        mentorInfo.put("email", safe(mentor.getEmail()));
                        resp.put("mentor", mentorInfo);
                    });
            }
        }

        return ResponseEntity.ok(resp);
    }

    // ── MARKS ─────────────────────────────────────────────────────────────────
    @GetMapping("/marks")
    public ResponseEntity<List<Map<String, Object>>> marks(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getMarksByUserId(uid(r)));
    }

    // ── GPA ───────────────────────────────────────────────────────────────────
    @GetMapping("/gpa")
    public ResponseEntity<List<Map<String, Object>>> getGpa(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getSgpaByUserId(uid(r)));
    }

    @PostMapping("/gpa")
    public ResponseEntity<?> saveGpa(
            HttpServletRequest r,
            @RequestBody Map<String, Object> body) {

        Object rawSem = body.get("semester");
        if (rawSem == null)
            return ResponseEntity.badRequest().body(Map.of("error", "semester required"));

        int semester;
        try { semester = ((Number) rawSem).intValue(); }
        catch (ClassCastException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "semester must be a number"));
        }

        Double sgpa = body.get("sgpa") != null ? ((Number) body.get("sgpa")).doubleValue() : null;
        Double cgpa = body.get("cgpa") != null ? ((Number) body.get("cgpa")).doubleValue() : null;

        return ResponseEntity.ok(dataStore.upsertSgpa(uid(r), semester, sgpa, cgpa));
    }

    // ── ATTENDANCE ────────────────────────────────────────────────────────────
    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> attendance(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getAttByUserId(uid(r)));
    }

    // ── CERTIFICATES ──────────────────────────────────────────────────────────
    @GetMapping("/certificates")
    public ResponseEntity<List<Map<String, Object>>> certs(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getCertsByUserId(uid(r)));  // no file_data (fast)
    }

    /** GET /api/mentee/certificates/{id} — returns full cert including file_data for viewer */
    @GetMapping("/certificates/{id}")
    public ResponseEntity<Map<String, Object>> certById(
            HttpServletRequest r,
            @PathVariable int id) {
        return dataStore.getCertByIdFull(id)
            .map(cert -> {
                int ownerId = ((Number) cert.get("user_id")).intValue();
                // Allow owner OR any mentor to view
                if (ownerId != uid(r) && !"mentor".equalsIgnoreCase(urole(r)))
                    return ResponseEntity.status(403).<Map<String, Object>>body(
                        Map.of("error", "Not your certificate"));
                return ResponseEntity.ok(cert);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/certificates")
    public ResponseEntity<Map<String, Object>> uploadCert(
            HttpServletRequest r,
            @RequestParam("file")     MultipartFile file,
            @RequestParam("title")    String title,
            @RequestParam("provider") String provider,
            @RequestParam(value = "issue_date", required = false) String issueDate)
            throws IOException {

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(),
                   Paths.get(uploadDir, filename),
                   StandardCopyOption.REPLACE_EXISTING);

        Map<String, Object> cert = dataStore.addCert(
            uid(r), title, provider,
            issueDate != null ? issueDate : "", filename
        );
        cert.put("download_url", "/api/files/certificates/" + cert.get("id"));
        return ResponseEntity.ok(cert);
    }

    /**
     * Base64 upload — stores file content directly in the DB.
     * No disk access, no uploads folder.
     * Body: { title, provider, issue_date, file_type, file_data }
     * where file_data is a raw Base64 string (without the data:...;base64, prefix).
     */
    @PostMapping("/certificates/base64")
    public ResponseEntity<Map<String, Object>> uploadCertBase64(
            HttpServletRequest r,
            @RequestBody Map<String, String> body) {

        String title     = body.get("title");
        String provider  = body.get("provider");
        String issueDate = body.getOrDefault("issue_date", "");
        String fileType  = body.get("file_type");
        String fileData  = body.get("file_data");

        if (title    == null || title.isBlank())    return ResponseEntity.badRequest().body(Map.of("error", "title required"));
        if (provider == null || provider.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "provider required"));
        if (fileType == null || fileType.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "file_type required"));
        if (fileData == null || fileData.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "file_data required"));

        return ResponseEntity.ok(
            dataStore.addCertBase64(uid(r), title, provider, issueDate, fileType, fileData)
            // addCertBase64 internally calls certToMap (no file_data), so re-fetch full
        );
    }

    /** DELETE /api/mentee/certificates/{id} — only the owning mentee can delete */
    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<Map<String, Object>> deleteCert(
            HttpServletRequest r,
            @PathVariable int id) {

        // Ownership check — ensures mentees can't delete each other's certs
        var certOpt = dataStore.getCertById(id);
        if (certOpt.isEmpty()) return ResponseEntity.notFound().build();

        Map<String, Object> cert = certOpt.get();
        int ownerId = ((Number) cert.get("user_id")).intValue();
        if (ownerId != uid(r))
            return ResponseEntity.status(403).body(Map.of("error", "You are not the owner of this certificate"));

        dataStore.deleteCert(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }
    @GetMapping("/remarks")
    public ResponseEntity<List<Map<String, Object>>> remarks(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getRemarksByMenteeId(uid(r)));
    }

    private String safe(String s) { return s != null ? s : ""; }
}
