package com.skcet.attendance.service;

import com.google.cloud.firestore.*;
import com.skcet.attendance.dto.AttendanceRecord;
import com.skcet.attendance.model.FirebaseAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FirestoreService {

    private static final Logger log = LoggerFactory.getLogger(FirestoreService.class);
    private final Firestore firestore;

    public FirestoreService(Firestore firestore) {
        this.firestore = firestore;
    }

    public void saveAttendance(String email, String sessionId, double confidence) {
        try {
            String attendanceId = UUID.randomUUID().toString();
            LocalDateTime now = LocalDateTime.now();

            // Determine status based on confidence and time
            String status = determineStatus(confidence, now);

            AttendanceRecord record = new AttendanceRecord(
                    attendanceId,
                    email,
                    getCurrentUserEmail(),
                    "Class Attendance", // You can make this dynamic
                    status,
                    now,
                    sessionId,
                    confidence
            );

            firestore.collection("attendance")
                    .document(attendanceId)
                    .set(record)
                    .get();

            log.info("Attendance saved for student: {} with status: {}", email, status);

        } catch (Exception e) {
            log.error("Failed to save attendance: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save attendance", e);
        }
    }

    public List<AttendanceRecord> getAllAttendance() {
        try {
            QuerySnapshot snapshot = firestore.collection("attendance")
                    .orderBy("timestamp", Query.Direction.DESCENDING)
                    .get()
                    .get();

            List<AttendanceRecord> records = new ArrayList<>();
            for (QueryDocumentSnapshot document : snapshot) {
                records.add(document.toObject(AttendanceRecord.class));
            }

            return records;

        } catch (Exception e) {
            log.error("Failed to get attendance records: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get attendance records", e);
        }
    }

    public List<AttendanceRecord> getStudentAttendance(String email) {
        try {
            QuerySnapshot snapshot = firestore.collection("attendance")
                    .whereEqualTo("email", email)
                    .orderBy("timestamp", Query.Direction.DESCENDING)
                    .get()
                    .get();

            List<AttendanceRecord> records = new ArrayList<>();
            for (QueryDocumentSnapshot document : snapshot) {
                records.add(document.toObject(AttendanceRecord.class));
            }

            return records;

        } catch (Exception e) {
            log.error("Failed to get student attendance: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get student attendance", e);
        }
    }

    public void saveStudentProfile(String email, String name) {
        try {
            firestore.collection("students")
                    .document(email)
                    .set(new StudentProfile(email, name))
                    .get();

            log.info("Student profile saved: {}", email);

        } catch (Exception e) {
            log.error("Failed to save student profile: {}", e.getMessage(), e);
        }
    }

    private String determineStatus(double confidence, LocalDateTime timestamp) {
        if (confidence >= 0.8) {
            return "present";
        } else if (confidence >= 0.6) {
            return "late";
        } else {
            return "absent";
        }
    }

    private String getCurrentUserEmail() {
        try {
            FirebaseAuthenticationToken auth =
                    (FirebaseAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            return auth.getEmail();
        } catch (Exception e) {
            return "system";
        }
    }

    // Inner class for student profile
    public static class StudentProfile {
        private String email;
        private String name;
        private LocalDateTime createdAt;

        public StudentProfile() {}

        public StudentProfile(String email, String name) {
            this.email = email;
            this.name = name;
            this.createdAt = LocalDateTime.now();
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
