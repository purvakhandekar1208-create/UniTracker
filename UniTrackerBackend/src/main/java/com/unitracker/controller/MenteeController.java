package com.unitracker.controller;

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

    private final DataStore dataStore;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private int    uid(HttpServletRequest r) { return (int)    r.getAttribute("userId"); }
    private String uname(HttpServletRequest r) { return (String) r.getAttribute("userName"); }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(HttpServletRequest r) {
        return dataStore.findById(uid(r)).map(u -> {
            Map<String, Object> safe = new LinkedHashMap<>(u);
            safe.remove("password");
            return ResponseEntity.ok(safe);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(HttpServletRequest r) {
        int    id   = uid(r);
        String name = uname(r);

        double avg = dataStore.getAttByUserId(id).stream()
                .mapToInt(a -> (int) a.get("percentage"))
                .average().orElse(0);

        return ResponseEntity.ok(Map.of(
            "name",              name,
            "avg_attendance",    Math.round(avg),
            "certificate_count", dataStore.getCertsByUserId(id).size(),
            "course_count",      dataStore.getCoursesByUserId(id).size(),
            "recent_remarks",    dataStore.getRemarksByMenteeId(id),
            "recent_certs",      dataStore.getCertsByUserId(id)
        ));
    }

    @GetMapping("/marks")
    public ResponseEntity<List<Map<String, Object>>> marks(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getMarksByUserId(uid(r)));
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> attendance(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getAttByUserId(uid(r)));
    }

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

    @GetMapping("/remarks")
    public ResponseEntity<List<Map<String, Object>>> remarks(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getRemarksByMenteeId(uid(r)));
    }
}
