package com.skcet.attendance.controller;

import com.skcet.attendance.dto.AttendanceRecord;
import com.skcet.attendance.service.FirestoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AttendanceController {

    private final FirestoreService firestoreService;
private static final Logger log = LoggerFactory.getLogger(FaceController.class);
    // === ADMIN ONLY ===
    @GetMapping("/list-attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceRecord>> listAttendance() {
        try {
            List<AttendanceRecord> records = firestoreService.getAllAttendance();
            log.info("Retrieved {} attendance records", records.size());
            return ResponseEntity.ok(records);

        } catch (Exception e) {
            log.error("Failed to list attendance: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // === STUDENT + ADMIN ===
    @GetMapping("/student-attendance")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<List<AttendanceRecord>> getStudentAttendance(@RequestParam String email) {
        try {
            if (!isAdmin() && !getCurrentUserEmail().equalsIgnoreCase(email)) {
                log.warn("Unauthorized access attempt by {} to view {}", getCurrentUserEmail(), email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(List.of());
            }

            List<AttendanceRecord> records = firestoreService.getStudentAttendance(email);
            log.info("Retrieved {} attendance records for student: {}", records.size(), email);
            return ResponseEntity.ok(records);

        } catch (Exception e) {
            log.error("Failed to get student attendance: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // === ADMIN ONLY ===
    @GetMapping("/attendance-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttendanceStats> getAttendanceStats() {
        try {
            List<AttendanceRecord> allRecords = firestoreService.getAllAttendance();

            long totalRecords = allRecords.size();
            long presentCount = allRecords.stream().filter(r -> "present".equals(r.getStatus())).count();
            long lateCount = allRecords.stream().filter(r -> "late".equals(r.getStatus())).count();
            long absentCount = allRecords.stream().filter(r -> "absent".equals(r.getStatus())).count();

            double attendanceRate = totalRecords > 0 ? (double) presentCount / totalRecords * 100 : 0;

            AttendanceStats stats = new AttendanceStats(
                totalRecords, presentCount, lateCount, absentCount, attendanceRate
            );

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Failed to get attendance stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // === STUDENT + ADMIN ===
    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<String> postAttendance(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String sessionId = (String) body.get("sessionId");
            Double confidence = body.get("confidence") != null ? ((Number) body.get("confidence")).doubleValue() : 1.0;

            if (!isAdmin() && !getCurrentUserEmail().equalsIgnoreCase(email)) {
                log.warn("Unauthorized attendance post by {} for {}", getCurrentUserEmail(), email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed to mark attendance for others");
            }

            firestoreService.saveAttendance(email, sessionId, confidence);

            log.info("Attendance recorded for student: {}", email);
            return ResponseEntity.ok("Attendance recorded successfully");
        } catch (Exception e) {
            log.error("Failed to record attendance: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error recording attendance");
        }
    }

    // === Inner class for attendance stats ===
    public static class AttendanceStats {
        private long totalRecords;
        private long presentCount;
        private long lateCount;
        private long absentCount;
        private double attendanceRate;

        public AttendanceStats() {}

        public AttendanceStats(long totalRecords, long presentCount, long lateCount, long absentCount, double attendanceRate) {
            this.totalRecords = totalRecords;
            this.presentCount = presentCount;
            this.lateCount = lateCount;
            this.absentCount = absentCount;
            this.attendanceRate = attendanceRate;
        }

        public long getTotalRecords() { return totalRecords; }
        public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }
        public long getPresentCount() { return presentCount; }
        public void setPresentCount(long presentCount) { this.presentCount = presentCount; }
        public long getLateCount() { return lateCount; }
        public void setLateCount(long lateCount) { this.lateCount = lateCount; }
        public long getAbsentCount() { return absentCount; }
        public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }
        public double getAttendanceRate() { return attendanceRate; }
        public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }
    }

    // === Helpers ===
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
