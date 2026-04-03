package com.unitracker.controller;

import com.unitracker.service.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
public class MentorController {

    private final DataStore dataStore;

    private int uid(HttpServletRequest r) { return (int) r.getAttribute("userId"); }

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(HttpServletRequest r) {
        List<Map<String, Object>> mentees = dataStore.getAllMentees();

        long needsAttention = mentees.stream()
                .filter(m -> ((Number) m.getOrDefault("avg_attendance", 100)).intValue() < 75)
                .count();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("mentee_count",    mentees.size());
        resp.put("needs_attention", (int) needsAttention);
        resp.put("mentees",         mentees);
        return ResponseEntity.ok(resp);
    }

    // ── ALL MENTEES ───────────────────────────────────────────────────────────
    @GetMapping("/mentees")
    public ResponseEntity<List<Map<String, Object>>> allMentees(HttpServletRequest r) {
        return ResponseEntity.ok(dataStore.getAllMentees());
    }

    // ── MENTEE SUB-RESOURCES ──────────────────────────────────────────────────
    @GetMapping("/mentees/{id}/marks")
    public ResponseEntity<List<Map<String, Object>>> marks(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getMarksByUserId(id));
    }

    @GetMapping("/mentees/{id}/attendance")
    public ResponseEntity<List<Map<String, Object>>> attendance(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getAttByUserId(id));
    }

    @GetMapping("/mentees/{id}/certificates")
    public ResponseEntity<List<Map<String, Object>>> certs(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getCertsByUserId(id));
    }

    @GetMapping("/mentees/{id}/courses")
    public ResponseEntity<List<Map<String, Object>>> courses(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getCoursesByUserId(id));
    }

    @GetMapping("/mentees/{id}/remarks")
    public ResponseEntity<List<Map<String, Object>>> remarks(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getRemarksByMenteeId(id));
    }

    @PostMapping("/mentees/{id}/remarks")
    public ResponseEntity<Map<String, Object>> addRemark(
            HttpServletRequest r,
            @PathVariable int id,
            @RequestBody Map<String, String> body) {

        String message = body.get("message");
        if (message == null || message.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "message required"));

        String date = java.time.LocalDate.now().toString();
        return ResponseEntity.ok(dataStore.addRemark(uid(r), id, message, date));
    }

    // ── NEW: Mentor manually sets a mentee's attendance percentage ────────────
    @PutMapping("/mentees/{id}/attendance")
    public ResponseEntity<Map<String, Object>> updateAttendance(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        Object raw = body.get("percentage");
        if (raw == null)
            return ResponseEntity.badRequest().body(Map.of("error", "percentage required"));

        int percentage;
        try {
            percentage = ((Number) raw).intValue();
        } catch (ClassCastException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "percentage must be a number"));
        }

        if (percentage < 0 || percentage > 100)
            return ResponseEntity.badRequest().body(Map.of("error", "percentage must be between 0 and 100"));

        dataStore.upsertAttendanceOverride(id, percentage);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("mentee_id",      id);
        resp.put("avg_attendance", percentage);
        return ResponseEntity.ok(resp);
    }
}