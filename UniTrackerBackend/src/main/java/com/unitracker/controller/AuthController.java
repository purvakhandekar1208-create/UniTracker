package com.unitracker.controller;

import com.unitracker.entity.User;
import com.unitracker.repository.UserRepository;
import com.unitracker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil        jwtUtil;

    // single shared encoder instance (BCrypt is thread-safe)
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String role     = body.get("role");

        if (email == null || password == null || role == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Email, password and role are required"));

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return ResponseEntity.status(401).body(Map.of("error", "No account found with this email"));

        // Support both BCrypt-hashed and legacy plain-text passwords gracefully
        boolean matches = ENCODER.matches(password, user.getPassword())
                       || user.getPassword().equals(password);
        if (!matches)
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect password"));

        if (!user.getRole().equalsIgnoreCase(role))
            return ResponseEntity.status(401).body(Map.of("error", "You are registered as: " + user.getRole()));

        // Upgrade plain-text password to BCrypt hash on successful login
        if (!user.getPassword().startsWith("$2")) {
            user.setPassword(ENCODER.encode(password));
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId(), user.getName());
        return ResponseEntity.ok(buildResponse(user, token));
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String name     = body.get("name");
        String role     = body.get("role");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        if (password == null || password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Full name is required"));
        if (role == null || (!role.equals("mentor") && !role.equals("mentee")))
            return ResponseEntity.badRequest().body(Map.of("error", "Role must be mentor or mentee"));
        if (userRepository.findByEmail(email).isPresent())
            return ResponseEntity.status(409).body(Map.of("error", "An account with this email already exists"));

        User user = new User();
        user.setEmail(email);
        user.setPassword(ENCODER.encode(password));   // ← hash on register
        user.setName(name);
        user.setRole(role);
        user.setPhone(body.get("phone"));
        user.setRoll(body.get("roll"));
        user.setDivision(body.get("division"));
        user.setBatch(body.get("batch"));
        user.setDepartment(body.get("department"));

        String yearStr = body.get("year");
        String semStr  = body.get("semester");
        if (yearStr != null && !yearStr.isBlank()) {
            try { user.setYear(Integer.parseInt(yearStr)); } catch (NumberFormatException ignored) {}
        }
        if (semStr != null && !semStr.isBlank()) {
            try { user.setSemester(Integer.parseInt(semStr)); } catch (NumberFormatException ignored) {}
        }

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getId(), saved.getName());
        return ResponseEntity.ok(buildResponse(saved, token));
    }

    // ── HELPER ────────────────────────────────────────────────────────────────
    private Map<String, Object> buildResponse(User u, String token) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("token",        token);
        m.put("userId",       u.getId());
        m.put("name",         u.getName());
        m.put("email",        u.getEmail());
        m.put("role",         u.getRole());
        m.put("phone",        safe(u.getPhone()));
        m.put("roll",         safe(u.getRoll()));
        m.put("division",     safe(u.getDivision()));
        m.put("batch",        safe(u.getBatch()));
        m.put("department",   safe(u.getDepartment()));
        m.put("year",         u.getYear()     != null ? u.getYear()     : 0);
        m.put("semester",     u.getSemester() != null ? u.getSemester() : 0);
        m.put("parent1Phone", safe(u.getParent1Phone()));
        m.put("parent2Phone", safe(u.getParent2Phone()));
        return m;
    }

    private String safe(String s) { return s != null ? s : ""; }
}
