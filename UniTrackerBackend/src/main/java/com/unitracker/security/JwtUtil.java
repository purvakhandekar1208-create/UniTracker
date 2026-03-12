package com.unitracker.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey key() {
        byte[] raw = jwtSecret.getBytes();
        byte[] key = new byte[32];
        System.arraycopy(raw, 0, key, 0, Math.min(raw.length, 32));
        return Keys.hmacShaKeyFor(key);
    }

    public String generateToken(String email, String role, int userId, String name) {
        return Jwts.builder()
                .claims(Map.of("role", role, "userId", userId, "name", name))
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload();
    }

    public String  extractEmail(String t)  { return parse(t).getSubject(); }
    public String  extractRole(String t)   { return (String) parse(t).get("role"); }
    public int     extractUserId(String t) { return ((Number) parse(t).get("userId")).intValue(); }
    public String  extractName(String t)   { return (String) parse(t).get("name"); }

    public boolean isValid(String t) {
        try { parse(t); return true; } catch (Exception e) { return false; }
    }
}
