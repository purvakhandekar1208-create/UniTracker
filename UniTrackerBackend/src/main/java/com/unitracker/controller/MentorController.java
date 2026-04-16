package com.unitracker.controller;

import com.unitracker.entity.MentorBatch;
import com.unitracker.repository.MentorBatchRepository;
import com.unitracker.service.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
public class MentorController {

    private final DataStore              dataStore;
    private final MentorBatchRepository  mentorBatchRepository;

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

    // ── BATCH MANAGEMENT ──────────────────────────────────────────────────────

    /** GET /api/mentor/batches — list all batches this mentor has joined */
    @GetMapping("/batches")
    public ResponseEntity<List<Map<String, Object>>> getBatches(HttpServletRequest r) {
        int mentorId = uid(r);
        List<Map<String, Object>> result = new ArrayList<>();
        for (MentorBatch mb : mentorBatchRepository.findByMentorId(mentorId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",       mb.getBatch());          // use batch string as id (matches frontend)
            m.put("batch",    mb.getBatch());
            m.put("division", mb.getDivision());
            m.put("label",    mb.getBatch());
            m.put("div",      mb.getDivision());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /** POST /api/mentor/batches — join a batch; body: { "batch": "A1", "division": "A" } */
    @PostMapping("/batches")
    public ResponseEntity<Map<String, Object>> joinBatch(
            HttpServletRequest r,
            @RequestBody Map<String, String> body) {

        int    mentorId = uid(r);
        String batch    = body.get("batch");
        String division = body.getOrDefault("division", "");

        if (batch == null || batch.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "batch required"));

        // Upsert: if already joined, just return it
        MentorBatch mb = mentorBatchRepository
                .findByMentorIdAndBatch(mentorId, batch)
                .orElseGet(() -> mentorBatchRepository.save(
                        new MentorBatch(0, mentorId, batch, division)));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",       mb.getBatch());
        resp.put("batch",    mb.getBatch());
        resp.put("division", mb.getDivision());
        resp.put("label",    mb.getBatch());
        resp.put("div",      mb.getDivision());
        return ResponseEntity.ok(resp);
    }

    /** DELETE /api/mentor/batches/{batch} — leave a batch */
    @DeleteMapping("/batches/{batch}")
    @Transactional
    public ResponseEntity<Map<String, Object>> leaveBatch(
            HttpServletRequest r,
            @PathVariable String batch) {

        mentorBatchRepository.deleteByMentorIdAndBatch(uid(r), batch);
        return ResponseEntity.ok(Map.of("removed", batch));
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

    // ── MENTEE GPA (READ ONLY) ────────────────────────────────────────────────
    @GetMapping("/mentees/{id}/gpa")
    public ResponseEntity<List<Map<String, Object>>> getMenteeGpa(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getSgpaByUserId(id));
    }

    // ── ATTENDANCE: MENTOR ADDS/UPDATES A SPECIFIC MONTH ─────────────────────
    @PostMapping("/mentees/{id}/attendance")
    public ResponseEntity<Map<String, Object>> addMonthAttendance(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        String month    = (String) body.get("month");
        Object rawPct   = body.get("percentage");

        if (month == null || month.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "month required"));
        if (rawPct == null)
            return ResponseEntity.badRequest().body(Map.of("error", "percentage required"));

        int percentage;
        try { percentage = ((Number) rawPct).intValue(); }
        catch (ClassCastException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "percentage must be a number"));
        }
        if (percentage < 0 || percentage > 100)
            return ResponseEntity.badRequest().body(Map.of("error", "percentage must be 0–100"));

        return ResponseEntity.ok(dataStore.upsertMonthlyAttendance(id, month, percentage));
    }

    // ── LEGACY PUT OVERRIDE ───────────────────────────────────────────────────
    @PutMapping("/mentees/{id}/attendance")
    public ResponseEntity<Map<String, Object>> updateAttendance(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        Object raw = body.get("percentage");
        if (raw == null)
            return ResponseEntity.badRequest().body(Map.of("error", "percentage required"));

        int percentage;
        try { percentage = ((Number) raw).intValue(); }
        catch (ClassCastException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "percentage must be a number"));
        }
        if (percentage < 0 || percentage > 100)
            return ResponseEntity.badRequest().body(Map.of("error", "percentage must be 0–100"));

        dataStore.upsertAttendanceOverride(id, percentage);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("mentee_id",      id);
        resp.put("avg_attendance", percentage);
        return ResponseEntity.ok(resp);
    }
}