<<<<<<< HEAD
public class JwtAuthFilter {
    
=======
package com.unitracker.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component @RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            String token = h.substring(7);
            if (jwtUtil.isValid(token)) {
                req.setAttribute("userId",    jwtUtil.extractUserId(token));
                req.setAttribute("userEmail", jwtUtil.extractEmail(token));
                req.setAttribute("userName",  jwtUtil.extractName(token));
                req.setAttribute("userRole",  jwtUtil.extractRole(token));
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(jwtUtil.extractEmail(token), null,
                        List.of(new SimpleGrantedAuthority("ROLE_"+jwtUtil.extractRole(token).toUpperCase()))));
            }
        }
        chain.doFilter(req, res);
    }
>>>>>>> b37d3623209b76eda8b7a46660680ac00cd53c93
}
