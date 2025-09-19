package com.skcet.attendance.service;

import com.skcet.attendance.Entity.Attendance;
import com.skcet.attendance.Repo.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository repo;

    public AttendanceService(AttendanceRepository repo) {
        this.repo = repo;
    }

    public Attendance saveAttendance(String studentEmail, TokenService.AttendancePayload payload) {
        Attendance attendance = new Attendance();
        attendance.setStudentEmail(studentEmail);

        // Copy QR payload into attendance record
        attendance.setStaffId(payload.getStaffId());
        attendance.setStaffName(payload.getStaffName());
        attendance.setClassName(payload.getClassName());
        attendance.setSessionDate(payload.getSessionDate());
        attendance.setPeriod(payload.getPeriod());
        attendance.setStartTime(payload.getStartTime());
        attendance.setEndTime(payload.getEndTime());
        attendance.setCourseId(payload.getCourseId());
        attendance.setCourseName(payload.getCourseName());
        attendance.setLocation(payload.getLocation());
        attendance.setAttendanceType(payload.getAttendanceType());

        // Marked when student scans
        attendance.setMarkedAt(LocalDateTime.now());

        // Basic logic for now (can enhance later with time comparison)
        attendance.setStatus("present");

        return repo.save(attendance);
    }

    public List<Attendance> getAttendanceByStudent(String email) {
        return repo.findByStudentEmail(email);
    }

    public List<Attendance> getAllAttendance() {
        return repo.findAll();
    }
}
