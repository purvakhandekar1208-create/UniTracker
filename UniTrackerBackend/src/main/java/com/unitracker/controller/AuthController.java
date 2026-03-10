package com.unitracker.controller;
import com.unitracker.security.JwtUtil;
import com.unitracker.service.DataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,String> body) {
        String email=body.get("email"), password=body.get("password"), role=body.get("role");
        if (email==null||password==null||role==null)
            return ResponseEntity.badRequest().body(Map.of("error","email, password and role are required"));
        Optional<Map<String,Object>> opt = DataStore.findUserByEmail(email);
        if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error","User not found"));
        Map<String,Object> user = opt.get();
        if (!user.get("password").toString().equals(password))
            return ResponseEntity.status(401).body(Map.of("error","Incorrect password"));
        if (!user.get("role").toString().equalsIgnoreCase(role))
            return ResponseEntity.status(401).body(Map.of("error","Role mismatch. You are registered as: "+user.get("role")));
        int uid=(int)user.get("id"); String name=(String)user.get("name"), urole=(String)user.get("role");
        String token = jwtUtil.generateToken(email, urole, uid, name);
        return ResponseEntity.ok(Map.of("token",token,"userId",uid,"name",name,"email",email,"role",urole));
    }
}
