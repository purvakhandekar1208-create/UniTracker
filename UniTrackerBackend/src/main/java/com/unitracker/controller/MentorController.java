package com.unitracker.controller;

import com.unitracker.service.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
public class MentorController {

    private final DataStore dataStore;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(HttpServletRequest r) {
        String name = (String) r.getAttribute("userName");

        List<Map<String, Object>> allMentees = dataStore.getAllMentees();

        // Find mentees with avg attendance below 75%
        List<Map<String, Object>> low = allMentees.stream()
                .filter(u -> {
                    double avg = dataStore.getAttByUserId((int) u.get("id")).stream()
                            .mapToInt(a -> (int) a.get("percentage"))
                            .average().orElse(100);
                    return avg < 75;
                })
                .map(u -> {
                    Map<String, Object> safe = new LinkedHashMap<>(u);
                    safe.remove("password");
                    return safe;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "mentor_name",           name,
            "total_mentees",         allMentees.size(),
            "low_attendance_alerts", low
        ));
    }

    @GetMapping("/mentees")
    public ResponseEntity<List<Map<String, Object>>> mentees() {
        return ResponseEntity.ok(
            dataStore.getAllMentees().stream().map(u -> {
                int id = (int) u.get("id");
                Map<String, Object> s = new LinkedHashMap<>(u);
                s.remove("password");
                s.put("cert_count",   dataStore.getCertsByUserId(id).size());
                s.put("course_count", dataStore.getCoursesByUserId(id).size());
                double avg = dataStore.getAttByUserId(id).stream()
                        .mapToInt(a -> (int) a.get("percentage")).average().orElse(0);
                s.put("avg_attendance", Math.round(avg));
                return s;
            }).collect(Collectors.toList())
        );
    }

    @GetMapping("/mentees/{id}/marks")
    public ResponseEntity<?> marks(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getMarksByUserId(id));
    }

    @GetMapping("/mentees/{id}/attendance")
    public ResponseEntity<?> att(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getAttByUserId(id));
    }

    @GetMapping("/mentees/{id}/certificates")
    public ResponseEntity<?> certs(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getCertsByUserId(id));
    }

    @GetMapping("/mentees/{id}/courses")
    public ResponseEntity<?> courses(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getCoursesByUserId(id));
    }

    @GetMapping("/mentees/{id}/remarks")
    public ResponseEntity<?> remarks(@PathVariable int id) {
        return ResponseEntity.ok(dataStore.getRemarksByMenteeId(id));
    }

    @PostMapping("/mentees/{id}/remarks")
    public ResponseEntity<Map<String, Object>> addRemark(HttpServletRequest r,
                                                          @PathVariable int id,
                                                          @RequestBody Map<String, String> b) {
        String msg = b.get("message");
        if (msg == null || msg.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "message required"));

        int    mid   = (int)    r.getAttribute("userId");
        String mname = (String) r.getAttribute("userName");

        String mteeName = dataStore.findById(id)
                .map(u -> u.get("name").toString()).orElse("Unknown");

        return ResponseEntity.ok(
            dataStore.addRemark(mid, id, msg, LocalDate.now().toString())
        );
    }
}
