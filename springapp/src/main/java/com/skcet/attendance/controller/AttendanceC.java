package com.skcet.attendance.controller;

import com.skcet.attendance.Entity.Attendance;
import com.skcet.attendance.service.AttendanceService;
import com.skcet.attendance.service.TokenService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceC {

    private final AttendanceService service;
    private final TokenService tokenService;

    public AttendanceC(AttendanceService service, TokenService tokenService) {
        this.service = service;
        this.tokenService = tokenService;
    }

    @PostMapping("/mark")
    public Attendance markAttendance(
            @RequestParam String studentEmail,
            @RequestParam String token
    ) {
        TokenService.AttendancePayload payload = tokenService.validateToken(token);
        if (payload == null) {
            throw new RuntimeException("Invalid or expired QR token");
        }
        return service.saveAttendance(studentEmail, payload);
    }

    @GetMapping("/student/{email}")
    public List<Attendance> getStudentAttendance(@PathVariable String email) {
        return service.getAttendanceByStudent(email);
    }

    @GetMapping("/all")
    public List<Attendance> getAllAttendance() {
        return service.getAllAttendance();
    }
}
