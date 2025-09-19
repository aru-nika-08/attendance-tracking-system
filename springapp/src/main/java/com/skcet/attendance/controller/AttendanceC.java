package com.skcet.attendance.controller;

import com.skcet.attendance.Entity.Attendance;
import com.skcet.attendance.service.AttendanceService;
import com.skcet.attendance.service.TokenService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceC {

    private final AttendanceService service;
    private final TokenService tokenService;

    private static final Logger log = LoggerFactory.getLogger(AttendanceC.class);

    public AttendanceC(AttendanceService service, TokenService tokenService) {
        this.service = service;
        this.tokenService = tokenService;
    }

    // POST endpoint for QR scanning
    @PostMapping("/mark")
    public Attendance markAttendance(@RequestParam String studentEmail,
                                     @RequestParam String token) {
        TokenService.AttendancePayload payload = tokenService.validateToken(token);
        if (payload == null) {
            log.warn("Invalid or expired QR token for student {}", studentEmail);
            throw new RuntimeException("Invalid or expired QR token");
        }
        log.info("Saving attendance for {} | course: {} | class: {}", studentEmail, payload.getCourseId(), payload.getClassName());
        return service.saveAttendance(studentEmail, payload);
    }

    // GET endpoint to allow clickable links
    @GetMapping("/scan")
    public RedirectView scanAttendance(@RequestParam String email, @RequestParam String token) {
        TokenService.AttendancePayload payload = tokenService.validateToken(token);
        if (payload != null) {
            service.saveAttendance(email, payload);
        }
        // Redirect to frontend dashboard
        return new RedirectView("http://localhost:5173/dashboard");
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
