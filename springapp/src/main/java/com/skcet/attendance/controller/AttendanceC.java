package com.skcet.attendance.controller;

import com.skcet.attendance.Entity.Attendance;
import com.skcet.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceC {

    @Autowired
    private AttendanceService attendanceService;

    // ---------------------------
    // 1️⃣ Stats endpoints
    // ---------------------------
    @GetMapping("/stats/{studentEmail}")
    public ResponseEntity<Map<String, Integer>> getStats(@PathVariable String studentEmail) {
        Map<String, Integer> stats = attendanceService.getStatsForStudent(studentEmail);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/student/{studentEmail}/summary")
    public ResponseEntity<Map<String, Integer>> getStudentSummary(@PathVariable String studentEmail) {
        Map<String, Integer> stats = attendanceService.getStatsForStudent(studentEmail);
        return ResponseEntity.ok(stats);
    }

    // ---------------------------
    // 2️⃣ Existing mark endpoint
    // ---------------------------
    @PostMapping("/mark")
    public ResponseEntity<String> markAttendance(@RequestBody Attendance request) {
        boolean success = attendanceService.markAttendance(
                request.getStudentEmail(),
                request.getStaffId(),
                request.getStaffName(),
                request.getClassName(),
                request.getSessionDate(),
                request.getPeriod(),
                request.isPresent()
        );
        if (success) {
            return ResponseEntity.ok("Attendance marked successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to mark attendance");
        }
    }

    // ---------------------------
    // 3️⃣ New endpoint: mark via token
    // ---------------------------
    @PostMapping("/mark/token")
    public ResponseEntity<String> markAttendanceByToken(
            @RequestParam String token,
            @RequestParam String studentEmail) {
        try {
            boolean success = attendanceService.markAttendanceFromToken(studentEmail, token);
            if (success) {
                return ResponseEntity.ok("Attendance marked successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to mark attendance");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token or attendance already marked");
        }
    }
    @GetMapping("/admin/class")
public ResponseEntity<List<Attendance>> getClassAttendance(
        @RequestParam String className,
        @RequestParam String date,
        @RequestParam String period) {
    List<Attendance> list = attendanceService.getClassAttendance(className, date, period);
    return ResponseEntity.ok(list);
}

}
