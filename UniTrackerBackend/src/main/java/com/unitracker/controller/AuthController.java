package com.unitracker.controller;

import com.unitracker.entity.User;
import com.unitracker.repository.UserRepository;
import com.unitracker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

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

        if (!user.getPassword().equals(password))
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect password"));

        if (!user.getRole().equalsIgnoreCase(role))
            return ResponseEntity.status(401).body(Map.of("error", "You are registered as: " + user.getRole()));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId(), user.getName());

        return ResponseEntity.ok(Map.of(
            "token",    token,
            "userId",   user.getId(),
            "name",     user.getName(),
            "email",    user.getEmail(),
            "role",     user.getRole(),
            "phone",    user.getPhone()    != null ? user.getPhone()    : "",
            "roll",     user.getRoll()     != null ? user.getRoll()     : "",
            "division", user.getDivision() != null ? user.getDivision() : ""
        ));
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String name     = body.get("name");
        String role     = body.get("role");
        String phone    = body.get("phone");
        String roll     = body.get("roll");
        String division = body.get("division");

        // Validate required fields
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        if (password == null || password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Full name is required"));
        if (role == null || (!role.equals("mentor") && !role.equals("mentee")))
            return ResponseEntity.badRequest().body(Map.of("error", "Role must be mentor or mentee"));

        // Check duplicate email
        if (userRepository.findByEmail(email).isPresent())
            return ResponseEntity.status(409).body(Map.of("error", "An account with this email already exists"));

        // Save new user
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setName(name);
        user.setRole(role);
        user.setPhone(phone);
        user.setRoll(roll);
        user.setDivision(division);

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getId(), saved.getName());

        return ResponseEntity.ok(Map.of(
            "token",    token,
            "userId",   saved.getId(),
            "name",     saved.getName(),
            "email",    saved.getEmail(),
            "role",     saved.getRole(),
            "phone",    saved.getPhone()    != null ? saved.getPhone()    : "",
            "roll",     saved.getRoll()     != null ? saved.getRoll()     : "",
            "division", saved.getDivision() != null ? saved.getDivision() : ""
        ));
    }
}
