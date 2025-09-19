package com.skcet.attendance.controller;

import com.skcet.attendance.dto.FaceVerifyRequest;
import com.skcet.attendance.dto.FaceVerifyResponse;
import com.skcet.attendance.service.AzureFaceService;
import com.skcet.attendance.service.FirestoreService;
import com.skcet.attendance.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class FaceController {

    private final AzureFaceService azureFaceService;
    private final FirestoreService firestoreService;
    private static final Logger log = LoggerFactory.getLogger(FaceController.class);
    // Store active sessions (should match QRController)
    private final Map<String, String> activeSessions = new HashMap<>();

    @PostMapping("/verify-face")
    public ResponseEntity<FaceVerifyResponse> verifyFace(@RequestBody FaceVerifyRequest request) {
        try {
            // Validate session
            String sessionEmail = activeSessions.get(request.getSessionId());
            if (sessionEmail == null) {
                log.warn("Invalid session ID: {}", request.getSessionId());
                return ResponseEntity.ok(new FaceVerifyResponse(false, "Invalid session", 0.0));
            }
            
            if (!sessionEmail.equals(request.getEmail())) {
                log.warn("Email mismatch for session: {}", request.getSessionId());
                return ResponseEntity.ok(new FaceVerifyResponse(false, "Email mismatch", 0.0));
            }
            
            // Perform face verification
            double confidence = azureFaceService.detectAndVerifyFace(request.getImage(), request.getEmail());
            
            if (confidence >= 0.6) { // Threshold for successful verification
                // Save attendance
                firestoreService.saveAttendance(request.getEmail(), request.getSessionId(), confidence);
                
                // Clear session
                activeSessions.remove(request.getSessionId());
                
                log.info("Face verification successful for: {} with confidence: {}", request.getEmail(), confidence);
                
                return ResponseEntity.ok(new FaceVerifyResponse(true, "Face verification successful", confidence));
            } else {
                log.warn("Face verification failed for: {} with confidence: {}", request.getEmail(), confidence);
                return ResponseEntity.ok(new FaceVerifyResponse(false, "Face verification failed", confidence));
            }
            
        } catch (Exception e) {
            log.error("Face verification error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/face-status/{sessionId}")
    public ResponseEntity<Map<String, Object>> getFaceStatus(@PathVariable String sessionId) {
        String email = activeSessions.get(sessionId);
        Map<String, Object> response = new HashMap<>();
        
        if (email != null) {
            response.put("valid", true);
            response.put("email", email);
        } else {
            response.put("valid", false);
        }
        
        return ResponseEntity.ok(response);
    }
}


