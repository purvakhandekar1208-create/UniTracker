package com.unitracker.controller;

import com.unitracker.entity.User;
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

    private final DataStore        dataStore;
    private final UserRepository   userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private int    uid(HttpServletRequest r)   { return (int)    r.getAttribute("userId"); }
    private String uname(HttpServletRequest r) { return (String) r.getAttribute("userName"); }

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

        // Allow updating contact and academic info (not email/password/role here)
        if (body.containsKey("phone"))        user.setPhone(body.get("phone"));
        if (body.containsKey("parent1Phone")) user.setParent1Phone(body.get("parent1Phone"));
        if (body.containsKey("parent2Phone")) user.setParent2Phone(body.get("parent2Phone"));
        if (body.containsKey("roll"))         user.setRoll(body.get("roll"));
        if (body.containsKey("division"))     user.setDivision(body.get("division"));
        if (body.containsKey("batch"))        user.setBatch(body.get("batch"));
        if (body.containsKey("department"))   user.setDepartment(body.get("department"));
        if (body.containsKey("year"))         { try { user.setYear(Integer.parseInt(body.get("year"))); } catch (Exception ignored) {} }
        if (body.containsKey("semester"))     { try { user.setSemester(Integer.parseInt(body.get("semester"))); } catch (Exception ignored) {} }

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
        resp.put("course_count",      dataStore.getCoursesByUserId(id).size());
        resp.put("remarks",           dataStore.getRemarksByMenteeId(id));
        resp.put("certificates",      dataStore.getCertsByUserId(id));

        // Academic info for dashboard banner
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
        }

        return ResponseEntity.ok(resp);
    }

    // ── MARKS ─────────────────────────────────────────────────────────────────
    @GetMapping("/marks")
    public ResponseEntity<List<Map<String, Object>>> marks(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getMarksByUserId(uid(r)));
    }
    

    // ── ATTENDANCE ────────────────────────────────────────────────────────────
    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> attendance(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getAttByUserId(uid(r)));
    }
    

    // ── COURSES ───────────────────────────────────────────────────────────────
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getCoursesByUserId(uid(r)));
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> addCourse(HttpServletRequest r,
                                                          @RequestBody Map<String, Object> b) {
        String cn   = (String) b.get("course_name");
        String prov = (String) b.get("provider");
        if (cn == null || prov == null)
            return ResponseEntity.badRequest().body(Map.of("error", "course_name and provider required"));
        int    prog   = b.get("progress") != null ? ((Number) b.get("progress")).intValue() : 0;
        String status = (String) b.getOrDefault("status", "Ongoing");
        return ResponseEntity.ok(dataStore.addCourse(uid(r), cn, prov, prog, status));
    }

    // ── CERTIFICATES ──────────────────────────────────────────────────────────
    @GetMapping("/certificates")
    public ResponseEntity<List<Map<String, Object>>> certs(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getCertsByUserId(uid(r)));
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

    // ── REMARKS ───────────────────────────────────────────────────────────────
    @GetMapping("/remarks")
    public ResponseEntity<List<Map<String, Object>>> remarks(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getRemarksByMenteeId(uid(r)));
    }

    private String safe(String s) { return s != null ? s : ""; }
}

