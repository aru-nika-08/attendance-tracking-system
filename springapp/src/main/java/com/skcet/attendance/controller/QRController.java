package com.skcet.attendance.controller;

import com.skcet.attendance.dto.AttendanceInfo;
import com.skcet.attendance.dto.QRGenerateResponse;
import com.skcet.attendance.dto.QRValidateRequest;
import com.skcet.attendance.dto.QRValidateResponse;
import com.skcet.attendance.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173") // Update if you access from mobile
public class QRController {

    private final TokenService tokenService;

    // Store active sessions (consider Redis for production)
    private final Map<String, String> activeSessions = new HashMap<>();

    // --- Generate QR dynamically based on staff input ---
    @PostMapping("/generate-qr")
public ResponseEntity<QRGenerateResponse> generateQR(@RequestBody AttendanceInfo info) {
    try {
        // Pass all required info to the TokenService
        String token = tokenService.generateToken(
                String.valueOf(info.getStaffId()),
                info.getStaffName(),
                info.getSessionDate(),
                info.getPeriod(),
                info.getStartTime(),
                info.getEndTime(),
                String.valueOf(info.getCourseId()),
                info.getCourseName(),
                info.getLocation(),
                info.getAttendanceType()
        );

        long expiresAt = System.currentTimeMillis() + tokenService.getQrTtlMs();

        return ResponseEntity.ok(new QRGenerateResponse(token, expiresAt));
    } catch (Exception e) {
        log.error("Failed to generate QR token: {}", e.getMessage());
        return ResponseEntity.internalServerError().build();
    }
}


    // --- Validate QR scanned by student ---
    @PostMapping("/validate-qr")
public ResponseEntity<QRValidateResponse> validateQR(@RequestBody QRValidateRequest request) {
    try {
        // validateToken now returns AttendancePayload if valid, or null if invalid/expired
        TokenService.AttendancePayload payload = tokenService.validateToken(request.getToken());

        if (payload != null) {
            // token is valid, create session
            String sessionId = tokenService.generateSessionId();
            activeSessions.put(sessionId, request.getEmail());

            log.info("QR validation successful for: {} | Staff: {} | Class: {}",
                     request.getEmail(), payload.getStaffName(), payload.getCourseName());

            return ResponseEntity.ok(new QRValidateResponse(true, sessionId));
        } else {
            // token invalid or expired
            log.warn("QR validation failed for: {}", request.getEmail());
            return ResponseEntity.ok(new QRValidateResponse(false, null));
        }

    } catch (Exception e) {
        log.error("QR validation error: {}", e.getMessage());
        return ResponseEntity.internalServerError().build();
    }
}

    // --- Session endpoints ---
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

    @PostMapping("/attendance")
public ResponseEntity<?> markAttendance(@RequestBody Map<String, String> body) {
    String token = body.get("token");
    try {
        TokenService.AttendancePayload payload = tokenService.validateToken(token);

        if (payload == null) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }

        // save attendance logic here
        log.info("Attendance marked for Staff {} | Course {}", payload.getStaffName(), payload.getCourseName());

        return ResponseEntity.ok("Attendance marked successfully");
    } catch (Exception e) {
        log.error("Error marking attendance: {}", e.getMessage());
        return ResponseEntity.internalServerError().body("Error marking attendance");
    }
}

}
