package com.skcet.attendance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class TokenService {

    @Value("${qr.ttl.ms}")
    private long qrTtlMs;

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String SECRET_KEY = "attendance-secret-key-2024";

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Generate QR token with attendance info
    public String generateToken(String staffId, String staffName, String sessionDate,
                                String period, String startTime, String endTime,
                                String courseId, String courseName, String location,
                                String attendanceType, String className) {
        try {
            long timestamp = System.currentTimeMillis();
            String randomId = UUID.randomUUID().toString().substring(0, 8);

            // Build JSON payload
            AttendancePayload payloadObj = new AttendancePayload(
                    timestamp, randomId, staffId, staffName, sessionDate,
                    period, startTime, endTime, courseId, courseName,
                    location, attendanceType, className
            );

            String payloadJson = objectMapper.writeValueAsString(payloadObj);

            String signature = generateSignature(payloadJson);

            // Combine payload and signature
            return Base64.getEncoder()
                    .encodeToString((payloadJson + "_" + signature).getBytes(StandardCharsets.UTF_8));

        } catch (Exception e) {
            log.error("Failed to generate token: {}", e.getMessage());
            throw new RuntimeException("Token generation failed", e);
        }
    }

    // Validate token and return payload if valid
    public AttendancePayload validateToken(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            int splitIndex = decoded.lastIndexOf("_");
            if (splitIndex == -1) return null;

            String payloadJson = decoded.substring(0, splitIndex);
            String signature = decoded.substring(splitIndex + 1);

            // Verify signature
            if (!signature.equals(generateSignature(payloadJson))) {
                return null;
            }

            // Parse JSON
            AttendancePayload payload = objectMapper.readValue(payloadJson, AttendancePayload.class);

            // Check TTL
            long now = System.currentTimeMillis();
            if ((now - payload.getTimestamp()) > qrTtlMs) {
                return null;
            }

            return payload; // return payload if valid

        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return null;
        }
    }

    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    private String generateSignature(String payload) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);

        byte[] signature = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(signature);
    }

    public long getQrTtlMs() {
        return qrTtlMs;
    }

    // Inner class for attendance info
    public static class AttendancePayload {
        private long timestamp;
        private String randomId;
        private String staffId;
        private String staffName;
        private String sessionDate;
        private String period;
        private String startTime;
        private String endTime;
        private String courseId;
        private String courseName;
        private String location;
        private String attendanceType;
        private String className; // ✅ Added

        public AttendancePayload() {}

        public AttendancePayload(long timestamp, String randomId, String staffId, String staffName,
                                 String sessionDate, String period, String startTime, String endTime,
                                 String courseId, String courseName, String location,
                                 String attendanceType, String className) {
            this.timestamp = timestamp;
            this.randomId = randomId;
            this.staffId = staffId;
            this.staffName = staffName;
            this.sessionDate = sessionDate;
            this.period = period;
            this.startTime = startTime;
            this.endTime = endTime;
            this.courseId = courseId;
            this.courseName = courseName;
            this.location = location;
            this.attendanceType = attendanceType;
            this.className = className;
        }

        // Getters
        public long getTimestamp() { return timestamp; }
        public String getRandomId() { return randomId; }
        public String getStaffId() { return staffId; }
        public String getStaffName() { return staffName; }
        public String getSessionDate() { return sessionDate; }
        public String getPeriod() { return period; }
        public String getStartTime() { return startTime; }
        public String getEndTime() { return endTime; }
        public String getCourseId() { return courseId; }
        public String getCourseName() { return courseName; }
        public String getLocation() { return location; }
        public String getAttendanceType() { return attendanceType; }
        public String getClassName() { return className; } // ✅ Getter added
    }
}
