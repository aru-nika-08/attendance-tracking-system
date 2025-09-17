package com.skcet.attendance.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.skcet.attendance.model.FirebaseAuthenticationToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final FirebaseAuth firebaseAuth;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String idToken = authHeader.substring(7);
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            
            String email = decodedToken.getEmail();
            String role = email != null && email.toLowerCase().contains("admin") ? "ADMIN" : "USER";
            
            FirebaseAuthenticationToken authentication = new FirebaseAuthenticationToken(
                decodedToken, 
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
        } catch (Exception e) {
            log.error("Firebase token verification failed: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}


