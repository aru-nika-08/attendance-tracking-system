package com.skcet.attendance.controller;

import com.skcet.attendance.dto.QRGenerateResponse;
import com.skcet.attendance.dto.QRValidateRequest;
import com.skcet.attendance.dto.QRValidateResponse;
import com.skcet.attendance.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class QRController {

    private final TokenService tokenService;
    
    // Store active sessions (in production, use Redis or database)
    private final Map<String, String> activeSessions = new HashMap<>();

    @GetMapping("/generate-qr")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QRGenerateResponse> generateQR() {
        try {
            String token = tokenService.generateToken();
            long expiresAt = System.currentTimeMillis() + tokenService.getQrTtlMs();
            
            log.info("Generated QR token: {}", token);
            
            return ResponseEntity.ok(new QRGenerateResponse(token, expiresAt));
            
        } catch (Exception e) {
            log.error("Failed to generate QR token: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/validate-qr")
    public ResponseEntity<QRValidateResponse> validateQR(@RequestBody QRValidateRequest request) {
        try {
            boolean isValid = tokenService.validateToken(request.getToken());
            
            if (isValid) {
                String sessionId = tokenService.generateSessionId();
                activeSessions.put(sessionId, request.getEmail());
                
                log.info("QR validation successful for: {}", request.getEmail());
                
                return ResponseEntity.ok(new QRValidateResponse(true, sessionId));
            } else {
                log.warn("QR validation failed for: {}", request.getEmail());
                return ResponseEntity.ok(new QRValidateResponse(false, null));
            }
            
        } catch (Exception e) {
            log.error("QR validation error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, String>> getSession(@PathVariable String sessionId) {
        String email = activeSessions.get(sessionId);
        if (email != null) {
            Map<String, String> response = new HashMap<>();
            response.put("email", email);
            response.put("valid", "true");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        activeSessions.remove(sessionId);
        return ResponseEntity.ok().build();
    }
}


